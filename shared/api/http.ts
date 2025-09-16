/**
 * HTTP Helper - Fetch-based API client with Zod validation
 * Replaces axios with native fetch + helper utilities
 */

import { z } from 'zod';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  cache?: RequestCache;
  signal?: AbortSignal;
  timeout?: number;
}

export interface ApiError extends Error {
  status: number;
  statusText: string;
  body?: unknown;
}

/**
 * Create an API error with status information
 */
const createApiError = async (response: Response): Promise<ApiError> => {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = await response.text();
  }
  
  const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as ApiError;
  error.status = response.status;
  error.statusText = response.statusText;
  error.body = body;
  
  return error;
};

/**
 * Validated HTTP request function with Zod schema
 */
export const requestWithSchema = async <T>(
  url: string,
  schema: z.ZodSchema<T>,
  options: RequestOptions = {}
): Promise<T> => {
  const response = await request(url, options);
  return schema.parse(response);
};

/**
 * Main HTTP request function
 */
export const request = async <T = unknown>(
  url: string,
  options: RequestOptions = {}
): Promise<T> => {
  const {
    method = 'GET',
    body,
    headers = {},
    cache = 'no-store',
    signal,
    timeout = 10000
  } = options;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  // Use provided signal or timeout signal
  const requestSignal = signal || controller.signal;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      cache,
      signal: requestSignal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw await createApiError(response);
    }

    // Handle different response types
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json() as Promise<T>;
    }
    
    return response.text() as Promise<T>;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
};

/**
 * HTTP method helpers
 */
export const http = {
  get: <T = unknown>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...options, method: 'GET' }),

  post: <T = unknown>(url: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'POST', body }),

  put: <T = unknown>(url: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'PUT', body }),

  patch: <T = unknown>(url: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'PATCH', body }),

  delete: <T = unknown>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...options, method: 'DELETE' }),
};

/**
 * Helper for retry logic
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries) break;
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw lastError!;
};
