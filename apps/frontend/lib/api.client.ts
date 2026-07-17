// Browser-side fetch, routed through the same-origin BFF proxy (`/api/proxy/*`).
// Cookies are same-origin (auto-included). `path` is the gateway path WITHOUT the /api
// prefix — e.g. apiFetch("auth/login") → /api/proxy/auth/login → gateway /api/auth/login.

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const clean = path.replace(/^\//, "");

  // Only send a JSON content-type when there's actually a body — otherwise Fastify's JSON
  // parser rejects the empty body with a 400 (e.g. logout / DELETE with no payload).
  const headers = new Headers(init.headers as HeadersInit | undefined);
  if (init.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`/api/proxy/${clean}`, { ...init, headers });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, res.status);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
