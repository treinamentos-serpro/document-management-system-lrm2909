const { randomUUID } = require('node:crypto');
const documentRepository = require('../repositories/documentRepository');

class DocumentNotFoundError extends Error {
  constructor() {
    super('Documento não encontrado.');
    this.code = 'DOCUMENT_NOT_FOUND';
    this.statusCode = 404;
  }
}

async function uploadDocument(file, owner = 'anonymous') {
  if (!file) {
    const error = new Error('O campo file é obrigatório.');
    error.code = 'FILE_REQUIRED';
    error.statusCode = 400;
    throw error;
  }

  const document = {
    id: randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner: owner || 'anonymous',
    storageFilename: file.filename,
    mimetype: file.mimetype,
  };

  return documentRepository.create(document);
}

function listDocuments() {
  return documentRepository.list();
}

async function downloadDocument(id) {
  const document = documentRepository.findById(id);

  if (!document) {
    throw new DocumentNotFoundError();
  }

  try {
    const content = await documentRepository.readFile(document);
    return {
      content,
      filename: document.originalName,
      mimetype: document.mimetype || 'application/octet-stream',
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new DocumentNotFoundError();
    }

    throw error;
  }
}

module.exports = {
  downloadDocument,
  DocumentNotFoundError,
  listDocuments,
  uploadDocument,
};