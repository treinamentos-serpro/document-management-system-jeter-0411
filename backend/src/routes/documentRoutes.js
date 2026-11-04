const express = require('express');
const documentController = require('../controllers/documentController');
const documentUpload = require('../middleware/documentUpload');
const requireOwner = require('../middleware/requireOwner');

const router = express.Router();

router.post('/upload', requireOwner, documentUpload.single('file'), documentController.uploadDocument);
router.get('/documents', requireOwner, documentController.listDocuments);
router.get('/documents/:id/download', requireOwner, documentController.downloadDocument);

module.exports = router;