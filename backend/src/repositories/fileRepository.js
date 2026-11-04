const path = require('node:path');

const backendDirectory = path.resolve(__dirname, '../..');
const configuredDirectory = process.env.DMS_STORAGE_DIR || 'storage';
const storageDirectory = path.resolve(backendDirectory, configuredDirectory);

function getFilePath(storageName) {
  return path.join(storageDirectory, storageName);
}

module.exports = { storageDirectory, getFilePath };