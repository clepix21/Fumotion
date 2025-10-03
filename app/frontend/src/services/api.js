const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function apiRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = (data && data.message) || res.statusText || 'Erreur requête API';
    throw new Error(message);
  }
  return data;
}

export function post(path, body) {
  return apiRequest(path, { method: 'POST', body: JSON.stringify(body) });
}

export function get(path) {
  return apiRequest(path, { method: 'GET' });
}
