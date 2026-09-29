import { useState } from 'react';
import { downloadDocument } from '../services/api.js';

export default function DownloadButton({ documentId, onError }) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);

    try {
      const { blob, filename } = await downloadDocument(documentId);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (downloadError) {
      onError(downloadError.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <button className="download-button" type="button" onClick={handleDownload} disabled={isDownloading}>
      {isDownloading ? 'Baixando...' : 'Baixar'}
    </button>
  );
}
