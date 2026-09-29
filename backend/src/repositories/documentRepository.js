const fs = require('node:fs/promises');
const path = require('node:path');

const storageDirectory = path.resolve(__dirname, '../../storage');
const documents = new Map();

async function ensureStorageDirectory() {
  await fs.mkdir(storageDirectory, { recursive: true });
}

function toPublicDocument(document) {
  const { storageFilename, mimetype, ...metadata } = document;
  return metadata;
}

async function create(document) {
  await ensureStorageDirectory();
  documents.set(document.id, document);
  return toPublicDocument(document);
}

function list() {
  return Array.from(documents.values())
    .sort((first, second) => second.uploadedAt.localeCompare(first.uploadedAt))
    .map(toPublicDocument);
}

function findById(id) {
  return documents.get(id);
}

async function readFile(document) {
  const storagePath = path.join(storageDirectory, document.storageFilename);
  return fs.readFile(storagePath);
}

module.exports = {
  create,
  findById,
  list,
  readFile,
};