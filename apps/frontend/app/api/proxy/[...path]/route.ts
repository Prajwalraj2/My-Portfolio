// BFF proxy: transparently mirrors the gateway's /api/* namespace to the same origin.
// Browser → /api/proxy/<x> → gateway <API_INTERNAL_URL>/api/<x>.
// Relays cookies both ways (session cookie ends up host-only on the frontend origin) and
// streams response bodies unchanged (so SSE chat flows through). Runtime-configured URL →
// one portable Docker image. See docs/FRONTEND_PLAN.md §1.
import { type NextRequest } from "next/server";

// 127.0.0.1 (not "localhost") to avoid Node resolving to IPv6 ::1 when the gateway is IPv4.
const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8000";

async function handler(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const target = new URL(`/api/${path.join("/")}`, API_INTERNAL_URL);
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body,
    redirect: "manual", // relay 3xx (e.g. OAuth) to the browser
  });

  // Relay response headers; strip hop-by-hop / encoding so the streamed body isn't mangled.
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  // Re-apply Set-Cookie correctly (multiple cookies).
  responseHeaders.delete("set-cookie");
  const setCookies = upstream.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookies) responseHeaders.append("set-cookie", cookie);

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
