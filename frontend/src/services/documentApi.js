const API_BASE_URL = '/api';

async function request(endpoint, ownerId, options = {}) {
  const headers = new Headers(options.headers);
  headers.set('X-User-Id', ownerId.trim());

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error?.message || 'Não foi possível concluir a operação.');
  }

  return response;
}

export async function listDocuments(ownerId, { signal } = {}) {
  const response = await request('/documents', ownerId, { signal });
  return response.json();
}

export async function uploadDocument(file, ownerId) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request('/upload', ownerId, {
    method: 'POST',
    body: formData
  });
  return response.json();
}

export async function downloadDocument(documentId, ownerId) {
  const response = await request(
    `/documents/${encodeURIComponent(documentId)}/download`,
    ownerId
  );
  return {
    blob: await response.blob(),
    filename: response.headers.get('content-disposition')
      ?.match(/filename="?([^";]+)"?/i)?.[1]
  };
}