const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');
const documentController = require('../controllers/documentController');

const storageDirectory = path.resolve(__dirname, '../../storage');
const maximumFileSize = Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024);
const allowedMimeTypes = process.env.ALLOWED_MIME_TYPES
  ? process.env.ALLOWED_MIME_TYPES.split(',').map((type) => type.trim())
  : null;

fs.mkdirSync(storageDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: storageDirectory,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: maximumFileSize },
  fileFilter: (req, file, callback) => {
    if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
      const error = new Error('Tipo de arquivo não permitido.');
      error.code = 'FILE_TYPE_NOT_ALLOWED';
      error.statusCode = 415;
      callback(error);
      return;
    }

    callback(null, true);
  },
});

const express = require('express');
const router = express.Router();

router.post('/upload', upload.single('file'), documentController.upload);
router.get('/documents', documentController.list);
router.get('/documents/:id/download', documentController.download);

module.exports = router;