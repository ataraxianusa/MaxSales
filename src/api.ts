// API base URL — set via VITE_API_URL env var
// Local dev: '' (same origin as Vite dev server)
// Production: 'https://voxia-api.your-subdomain.workers.dev'
const API_BASE = import.meta.env.VITE_API_URL || '';

export async function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
}
