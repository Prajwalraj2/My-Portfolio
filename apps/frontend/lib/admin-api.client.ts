// Browser-side fetch for the admin console, routed through the admin BFF (`/api/admin/*`),
// which injects the admin Bearer from the httpOnly cookie and auto-refreshes on 401.
// `path` is the gateway path WITHOUT the /api prefix — e.g. adminFetch("projects/all")
// → /api/admin/projects/all → gateway /api/projects/all.
import { ApiError } from "./api.client";

export async function adminFetch<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const clean = path.replace(/^\//, "");

  const headers = new Headers(init.headers as HeadersInit | undefined);
  if (init.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`/api/admin/${clean}`, { ...init, headers });

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

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
