const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

let storageDirectory;
let server;
let baseUrl;
let app;

before(async () => {
  storageDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'dms-test-'));
  process.env.DMS_STORAGE_DIR = storageDirectory;
  process.env.MAX_FILE_SIZE_BYTES = '32';
  app = require('../src/app');

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await fs.rm(storageDirectory, { recursive: true, force: true });
});

test('upload, list and download documents only for their owner', async () => {
  const form = new FormData();
  form.append('file', new Blob(['document contents']), 'sample.txt');

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'alice' },
    body: form
  });

  assert.equal(uploadResponse.status, 201);
  const document = await uploadResponse.json();
  assert.deepEqual(Object.keys(document).sort(), [
    'id', 'originalName', 'owner', 'size', 'uploadedAt'
  ]);
  assert.equal(document.originalName, 'sample.txt');
  assert.equal(document.owner, 'alice');

  const aliceList = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-Id': 'alice' }
  });
  assert.deepEqual(await aliceList.json(), [document]);

  const bobList = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-Id': 'bob' }
  });
  assert.deepEqual(await bobList.json(), []);

  const deniedDownload = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'bob' }
  });
  assert.equal(deniedDownload.status, 404);

  const download = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'alice' }
  });
  assert.equal(download.status, 200);
  assert.equal(await download.text(), 'document contents');
  assert.match(download.headers.get('content-disposition'), /sample\.txt/);
});

test('requires a user id and rejects files over the configured size limit', async () => {
  const missingOwnerForm = new FormData();
  missingOwnerForm.append('file', new Blob(['x']), 'sample.txt');
  const missingOwner = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: missingOwnerForm
  });
  assert.equal(missingOwner.status, 400);
  assert.equal((await missingOwner.json()).error.code, 'USER_ID_REQUIRED');

  const largeFileForm = new FormData();
  largeFileForm.append('file', new Blob(['x'.repeat(33)]), 'large.txt');
  const largeFile = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'alice' },
    body: largeFileForm
  });
  assert.equal(largeFile.status, 413);
  assert.equal((await largeFile.json()).error.code, 'FILE_TOO_LARGE');
});