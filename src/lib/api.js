const API_PREFIX = '/api';

export async function apiGet(path, query = {}) {
  const search = new URLSearchParams(query);
  const response = await fetch(`${API_PREFIX}/${path}?${search.toString()}`);
  if (!response.ok) {
    const payload = await safeJson(response);
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }
  return response.json();
}

export async function apiPost(path, payload) {
  const response = await fetch(`${API_PREFIX}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await safeJson(response);
    throw new Error(body.error || `Request failed: ${response.status}`);
  }
  return response.json();
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}
