// Server-side fetch to the gateway over the INTERNAL URL (k8s service DNS in prod,
// localhost in dev). Read at runtime → one portable Docker image. Used by Server Components.
import { cookies } from "next/headers";

// Use 127.0.0.1 (not "localhost") — Node's fetch resolves "localhost" to IPv6 ::1 first,
// which fails if the gateway binds IPv4 (0.0.0.0). 127.0.0.1 forces IPv4.
const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8000";

interface ServerFetchOptions {
  /** Forward the caller's session cookie (for authed pages). */
  auth?: boolean;
  /** ISR revalidate seconds; omit for request-time (no-store). */
  revalidate?: number;
  method?: string;
  body?: unknown;
  /** Suppress console.error logging (for expected failures like an anon /auth/me 401). */
  silent?: boolean;
}

export async function serverFetch<T = unknown>(
  path: string,
  opts: ServerFetchOptions = {}
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (opts.auth) {
    const jar = await cookies();
    const cookieHeader = jar.toString();
    if (cookieHeader) headers["cookie"] = cookieHeader;
  }

  let res: Response;
  try {
    res = await fetch(`${API_INTERNAL_URL}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      ...(opts.revalidate != null
        ? { next: { revalidate: opts.revalidate } }
        : { cache: "no-store" }),
    });
  } catch (err) {
    if (!opts.silent) {
      console.error(`[serverFetch] ${API_INTERNAL_URL}${path} — network error:`, err);
    }
    throw err;
  }

  if (!res.ok) {
    if (!opts.silent) console.error(`[serverFetch] ${path} responded ${res.status}`);
    throw new Error(`Gateway ${path} responded ${res.status}`);
  }
  return res.json() as Promise<T>;
}
