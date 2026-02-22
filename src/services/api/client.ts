import { readRuntimeEnv } from '../../config/env';

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

interface ErrorEnvelope {
  error: ApiError;
  request_id?: string;
}

type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: RequestMethod;
  query?: Record<string, string | number | undefined | null>;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
};

export class HttpError extends Error {
  status: number;
  code: string;
  field?: string;

  constructor(status: number, code: string, message: string, field?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const runtimeEnv = readRuntimeEnv();
  const baseUrl = runtimeEnv.apiBaseUrl.replace(/\/+$/, '');
  if (!baseUrl) {
    throw new HttpError(503, 'API_NOT_CONFIGURED', 'Missing EXPO_PUBLIC_API_BASE_URL');
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${baseUrl}${cleanPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

function normalizeError(status: number, payload?: unknown): HttpError {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const envelope = payload as ErrorEnvelope;
    return new HttpError(
      status,
      envelope.error?.code ?? 'INTERNAL_ERROR',
      envelope.error?.message ?? 'Request failed',
      envelope.error?.field
    );
  }

  return new HttpError(status, 'INTERNAL_ERROR', 'Request failed');
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, headers, token } = options;
  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const isJsonResponse = (response.headers.get('content-type') || '').includes('application/json');
  const payload = isJsonResponse ? await response.json() : undefined;

  if (!response.ok) {
    throw normalizeError(response.status, payload);
  }

  return payload as T;
}
