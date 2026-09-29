import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { listDocuments } from './services/api.js';
import './App.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadDocuments() {
    setIsLoading(true);

    try {
      setDocuments(await listDocuments());
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleUploaded(document) {
    setDocuments((currentDocuments) => [document, ...currentDocuments]);
    setNotice(`${document.originalName} foi enviado com sucesso.`);
    setError('');
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-mark">DMS</div>
        <div>
          <p className="eyebrow">Document Management System</p>
          <h1>Seu acervo, em ordem.</h1>
        </div>
      </header>

      <div className="content-grid">
        <UploadComponent onUploaded={handleUploaded} />
        <section className="status-panel" aria-live="polite">
          <span className="status-dot" />
          <div>
            <strong>Armazenamento local</strong>
            <p>Seus documentos ficam disponíveis nesta aplicação.</p>
          </div>
        </section>
      </div>

      {notice && <p className="notice" role="status">{notice}</p>}
      {error && <p className="form-error page-error" role="alert">{error}</p>}
      <DocumentList
        documents={documents}
        isLoading={isLoading}
        onDownloadError={setError}
      />
    </main>
  );
}
