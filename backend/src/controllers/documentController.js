const documentService = require('../services/documentService');

function upload(req, res, next) {
  documentService
    .uploadDocument(req.file, req.get('x-user-id'))
    .then((document) => res.status(201).json(document))
    .catch(next);
}

function list(req, res, next) {
  try {
    res.json({ documents: documentService.listDocuments() });
  } catch (error) {
    next(error);
  }
}

function download(req, res, next) {
  documentService
    .downloadDocument(req.params.id)
    .then(({ content, filename, mimetype }) => {
      res.type(mimetype);
      res.attachment(filename);
      res.send(content);
    })
    .catch(next);
}

module.exports = {
  download,
  list,
  upload,
};