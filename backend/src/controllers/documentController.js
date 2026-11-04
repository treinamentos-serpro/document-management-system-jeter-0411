const documentService = require('../services/documentService');

function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({
      error: {
        code: 'FILE_REQUIRED',
        message: 'Envie um arquivo no campo file.'
      }
    });
  }

  const document = documentService.createDocument(req.file, req.owner);
  return res.status(201).json(document);
}

function listDocuments(req, res) {
  return res.json(documentService.listDocuments(req.owner));
}

function downloadDocument(req, res, next) {
  const result = documentService.findDocumentForDownload(req.params.id, req.owner);

  if (!result) {
    return res.status(404).json({
      error: {
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Documento não encontrado.'
      }
    });
  }

  return res.download(result.filePath, result.metadata.originalName, (error) => {
    if (!error) {
      return;
    }

    if (error.code === 'ENOENT' && !res.headersSent) {
      return res.status(404).json({
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Documento não encontrado.'
        }
      });
    }

    return next(error);
  });
}

module.exports = { uploadDocument, listDocuments, downloadDocument };