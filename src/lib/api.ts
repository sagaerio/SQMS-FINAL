/**
 * HTTP client for the Django REST backend.
 * Handles JWT storage, auto-refresh on 401, and error handling.
 *
 * Backend URL: https://smart-queue-app-production.up.railway.app/api
 */

const REQUEST_TIMEOUT_MS = 8000;
const BASE_URL = 'https://smart-queue-app-production.up.railway.app/api';

const TOKEN_KEYS = {
  ACCESS: 'sqms_access',
  REFRESH: 'sqms_refresh',
} as const;

// ── Token Management ──────────────────────────────────────────────────────────

export async function getAccessToken(): Promise<string | null> {
  return localStorage.getItem(TOKEN_KEYS.ACCESS);
}

export async function getRefreshToken(): Promise<string | null> {
  return localStorage.getItem(TOKEN_KEYS.REFRESH);
}

export async function storeTokens(access: string, refresh: string): Promise<void> {
  localStorage.setItem(TOKEN_KEYS.ACCESS, access);
  localStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
}

export async function clearTokens(): Promise<void> {
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
}

// ── Fetch with timeout ────────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ── Silent token refresh ──────────────────────────────────────────────────────

async function refreshAccessToken(): Promise<string | null> {
  const refresh = await getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetchWithTimeout(`${BASE_URL}/accounts/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      await clearTokens();
      return null;
    }

    const { access } = await res.json();
    localStorage.setItem(TOKEN_KEYS.ACCESS, access);
    return access as string;
  } catch {
    return null;
  }
}

// ── Core request helper ───────────────────────────────────────────────────────

type ApiResult<T> = { data: T; error: null } | { data: null; error: string };

export async function apiRequest<T = unknown>(
  method: string,
  path: string,
  body?: Record<string, unknown> | FormData,
  auth = true,
): Promise<ApiResult<T>> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {};

  // Only set Content-Type for JSON, not for FormData
  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await getAccessToken();
    if (!token) return { data: null, error: 'Not authenticated' };
    headers['Authorization'] = `Bearer ${token}`;
  }

  const makeRequest = () =>
    fetchWithTimeout(url, {
      method,
      headers,
      body: body instanceof FormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
    });

  try {
    let res = await makeRequest();

    // Handle 401 (Unauthorized) with token refresh
    if (res.status === 401 && auth) {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        return { data: null, error: 'Session expired. Please log in again.' };
      }
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await makeRequest();

      if (res.status === 401) {
        await clearTokens();
        return { data: null, error: 'Session expired. Please log in again.' };
      }
    }

    // Handle 204 No Content
    if (res.status === 204) return { data: null as unknown as T, error: null };

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      let msg = `Request failed (${res.status})`;
      if (typeof json === 'object' && json !== null) {
        const j = json as Record<string, unknown>;
        if (typeof j.detail === 'string' && j.detail) msg = j.detail;
        else if (typeof j.message === 'string' && j.message) msg = j.message;
        else if (typeof j.error === 'string' && j.error) msg = j.error;
        else {
          const flat = Object.values(j)
            .flat()
            .filter((v): v is string => typeof v === 'string')
            .join(' · ');
          if (flat) msg = flat;
        }
      }
      return { data: null, error: msg };
    }

    return { data: json as T, error: null };
  } catch (e: unknown) {
    if (e instanceof Error && e.name === 'AbortError') {
      return { data: null, error: 'Connection timed out. Check your internet and try again.' };
    }
    return { data: null, error: 'Network error. Check your internet connection.' };
  }
}

// ── API Methods ───────────────────────────────────────────────────────────────

export const api = {
  get: <T = unknown>(path: string, auth = true): Promise<ApiResult<T>> =>
    apiRequest<T>('GET', path, undefined, auth),

  post: <T = unknown>(path: string, body?: Record<string, unknown> | FormData, auth = true): Promise<ApiResult<T>> =>
    apiRequest<T>('POST', path, body, auth),

  patch: <T = unknown>(path: string, body?: Record<string, unknown> | FormData, auth = true): Promise<ApiResult<T>> =>
    apiRequest<T>('PATCH', path, body, auth),

  put: <T = unknown>(path: string, body?: Record<string, unknown> | FormData, auth = true): Promise<ApiResult<T>> =>
    apiRequest<T>('PUT', path, body, auth),

  delete: <T = unknown>(path: string, auth = true): Promise<ApiResult<T>> =>
    apiRequest<T>('DELETE', path, undefined, auth),
};

// ── Django User Type (matching backend response) ──────────────────────────────

export interface DjangoUser {
  id: number;
  email: string;
  full_name: string;
  role: 'customer' | 'staff' | 'admin' | 'super_admin';
  phone?: string;
  business?: number | null;
  email_verified: boolean;
  created_at: string;
  counter_number?: number | null;
  assigned_branch_name?: string | null;
  assigned_services_names?: string[];
}

export interface AuthResponse {
  user: DjangoUser;
  tokens: {
    access: string;
    refresh: string;
  };
}
