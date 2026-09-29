import { useRef, useState } from 'react';
import { uploadDocument } from '../services/api.js';

export default function UploadComponent({ onUploaded }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setError('Selecione um arquivo para enviar.');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      const document = await uploadDocument(file);
      setFile(null);
      inputRef.current.value = '';
      onUploaded(document);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="upload-panel" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Novo documento</p>
        <h2>Envie um arquivo para o acervo</h2>
        <p className="muted">Arquivos armazenados localmente e prontos para consulta.</p>
      </div>
      <div className="upload-controls">
        <label className="file-picker">
          <span>{file ? file.name : 'Escolher arquivo'}</span>
          <input
            ref={inputRef}
            type="file"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              setError('');
            }}
          />
        </label>
        <button className="primary-button" type="submit" disabled={isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar arquivo'}
        </button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}
