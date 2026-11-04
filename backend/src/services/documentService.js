const crypto = require('node:crypto');
const path = require('node:path');
const documentRepository = require('../repositories/documentRepository');
const fileRepository = require('../repositories/fileRepository');

function toPublicDocument(document) {
  const { storageName, ...publicDocument } = document;
  return publicDocument;
}

function createDocument(file, owner) {
  const document = {
    id: crypto.randomUUID(),
    originalName: path.basename(file.originalname.replace(/\\/g, '/')) || 'document',
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    storageName: file.filename
  };

  documentRepository.save(document);
  return toPublicDocument(document);
}

function listDocuments(owner) {
  return documentRepository.findByOwner(owner).map(toPublicDocument);
}

function findDocumentForDownload(id, owner) {
  const document = documentRepository.findById(id);

  if (!document || document.owner !== owner) {
    return null;
  }

  return {
    metadata: toPublicDocument(document),
    filePath: fileRepository.getFilePath(document.storageName)
  };
}

module.exports = { createDocument, listDocuments, findDocumentForDownload };