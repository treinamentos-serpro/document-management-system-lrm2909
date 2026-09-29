import DownloadButton from './DownloadButton.jsx';

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export default function DocumentList({ documents, isLoading, onDownloadError }) {
  return (
    <section className="documents-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Acervo local</p>
          <h2>Documentos recentes</h2>
        </div>
        <span className="document-count">{documents.length} {documents.length === 1 ? 'item' : 'itens'}</span>
      </div>

      {isLoading && <p className="empty-state">Carregando documentos...</p>}
      {!isLoading && documents.length === 0 && (
        <p className="empty-state">Nenhum documento enviado ainda.</p>
      )}
      {!isLoading && documents.length > 0 && (
        <div className="document-table" role="table" aria-label="Documentos enviados">
          <div className="table-header" role="row">
            <span>Nome</span>
            <span>Tamanho</span>
            <span>Enviado em</span>
            <span aria-hidden="true" />
          </div>
          {documents.map((document) => (
            <div className="document-row" role="row" key={document.id}>
              <strong title={document.originalName}>{document.originalName}</strong>
              <span>{formatFileSize(document.size)}</span>
              <span>{formatDate(document.uploadedAt)}</span>
              <DownloadButton documentId={document.id} onError={onDownloadError} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
