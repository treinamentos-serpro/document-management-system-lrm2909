const apiPrefix = '/api';

class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function parseError(response) {
  try {
    const body = await response.json();
    return new ApiError(
      body.error?.message || 'Não foi possível concluir a operação.',
      response.status,
      body.error?.code,
    );
  } catch {
    return new ApiError('Não foi possível concluir a operação.', response.status);
  }
}

async function request(url, options) {
  const response = await fetch(`${apiPrefix}${url}`, options);

  if (!response.ok) {
    throw await parseError(response);
  }

  return response;
}

export async function listDocuments() {
  const response = await request('/documents');
  const body = await response.json();
  return body.documents;
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request('/upload', {
    method: 'POST',
    body: formData,
  });

  return response.json();
}

export async function downloadDocument(id) {
  const response = await request(`/documents/${encodeURIComponent(id)}/download`);
  const contentDisposition = response.headers.get('content-disposition');
  const filenameMatch = contentDisposition?.match(/filename="?([^";]+)"?/i);

  return {
    blob: await response.blob(),
    filename: filenameMatch?.[1] || 'documento',
  };
}
