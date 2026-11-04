const crypto = require('node:crypto');
const fs = require('node:fs');
const multer = require('multer');
const { storageDirectory } = require('../repositories/fileRepository');

const defaultMaxFileSize = 10 * 1024 * 1024;
const maxFileSize = Number(process.env.MAX_FILE_SIZE_BYTES || defaultMaxFileSize);

const storage = multer.diskStorage({
  destination(req, file, callback) {
    fs.mkdir(storageDirectory, { recursive: true }, (error) => {
      callback(error, storageDirectory);
    });
  },
  filename(req, file, callback) {
    callback(null, crypto.randomUUID());
  }
});

module.exports = multer({
  storage,
  limits: { fileSize: maxFileSize }
});