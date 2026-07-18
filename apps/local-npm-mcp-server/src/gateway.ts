// Authenticated HTTP client to the API Gateway (the single source of truth). The user's
// `pk_live_` key is sent as a Bearer token so scoped writes (book_meeting) are authorized.
import { config } from "./config";

export class GatewayError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "GatewayError";
    this.status = status;
  }
}

export const hasApiKey = (): boolean => Boolean(config.apiKey);

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
  return headers;
}

async function request(path: string, init: RequestInit, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${config.apiBase}${path}`, {
      ...init,
      headers: buildHeaders(),
      signal: controller.signal,
    });

    const raw = await res.text();
    let body: unknown;
    try {
      body = raw ? JSON.parse(raw) : undefined;
    } catch {
      body = raw;
    }

    if (!res.ok) {
      let message = `Gateway responded ${res.status}`;
      if (body && typeof body === "object" && "message" in body) {
        message = String((body as { message: unknown }).message);
      }
      throw new GatewayError(message, res.status);
    }
    return body;
  } catch (err) {
    if (err instanceof GatewayError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new GatewayError(`Request to the gateway timed out after ${timeoutMs}ms`);
    }
    throw new GatewayError(`Network error reaching the gateway: ${(err as Error).message}`);
  } finally {
    clearTimeout(timer);
  }
}

export async function gatewayGet(
  path: string,
  params?: Record<string, string | undefined>
): Promise<unknown> {
  let qs = "";
  if (params) {
    const entries = Object.entries(params).filter(([, v]) => v != null) as [string, string][];
    if (entries.length) qs = "?" + new URLSearchParams(entries).toString();
  }
  return request(path + qs, { method: "GET" }, 15000);
}

export async function gatewayPost(path: string, body: unknown): Promise<unknown> {
  return request(path, { method: "POST", body: JSON.stringify(body) }, 25000);
}

/** Pull `.data` out of the gateway's `{ data: ... }` envelope, with a fallback. */
export function unwrap<T>(res: unknown, fallback: T): T {
  if (res && typeof res === "object" && "data" in res) {
    return (res as { data: T }).data ?? fallback;
  }
  return fallback;
}
