import { API_BASE_URL } from '../config/apiBaseUrl';

export { API_BASE_URL };

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        ...init,
        headers: { 'Accept': 'application/json', ...(init?.headers || {}) },
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`API ${res.status}: ${body}`);
      }
      return res.json();
    } catch (e: any) {
      lastError = e;
      if (e.name === 'AbortError' || (e.message && e.message.includes('API 4'))) throw e;
      if (attempt < MAX_RETRIES) await new Promise<void>(r => setTimeout(r, RETRY_DELAY * (attempt + 1)));
    }
  }
  throw lastError ?? new Error('Request failed');
}
