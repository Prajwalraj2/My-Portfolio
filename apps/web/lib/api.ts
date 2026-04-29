
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

type NextFetchRequestConfig = {
  revalidate?: number | false;
  tags?: string[];
};

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetcher<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, cache, next } = options;

  const config: RequestInit & { next?: NextFetchRequestConfig } = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    cache,
    next,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message || "API request failed", errorData);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, options?: Omit<FetchOptions, "method" | "body">) =>
    fetcher<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">) =>
    fetcher<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">) =>
    fetcher<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">) =>
    fetcher<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: Omit<FetchOptions, "method" | "body">) =>
    fetcher<T>(endpoint, { ...options, method: "DELETE" }),
};

export type { ApiError };
