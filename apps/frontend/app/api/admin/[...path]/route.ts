// Admin BFF proxy: browser → /api/admin/<x> → gateway <API_INTERNAL_URL>/api/<x> with an
// Authorization: Bearer <admin_at> injected from the httpOnly cookie. On a 401 (expired access
// token) it refreshes using admin_rt, sets a fresh admin_at cookie, and retries once. Admin
// APIs are plain JSON, so bodies are buffered (no streaming needed).
import { type NextRequest, NextResponse } from "next/server";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8000";
const isProd = process.env.NODE_ENV === "production";
const SEVEN_DAYS = 60 * 60 * 24 * 7;

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const r = await fetch(`${API_INTERNAL_URL}/api/auth/admin/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!r.ok) return null;
  const j = await r.json().catch(() => null);
  return j?.data?.accessToken ?? null;
}

async function handler(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const method = request.method;
  const hasBody = method !== "GET" && method !== "HEAD";
  const bodyBuf = hasBody ? await request.arrayBuffer() : undefined;
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");

  const call = (token: string) => {
    const target = new URL(`/api/${path.join("/")}`, API_INTERNAL_URL);
    target.search = request.nextUrl.search;
    const headers = new Headers();
    headers.set("authorization", `Bearer ${token}`);
    if (contentType) headers.set("content-type", contentType);
    if (accept) headers.set("accept", accept);
    return fetch(target, {
      method,
      headers,
      body: hasBody ? bodyBuf : undefined,
      redirect: "manual",
    });
  };

  const accessToken = request.cookies.get("admin_at")?.value;
  const refreshToken = request.cookies.get("admin_rt")?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  let refreshed: string | null = null;
  let upstream = accessToken
    ? await call(accessToken)
    : new Response(null, { status: 401 });

  if (upstream.status === 401 && refreshToken) {
    refreshed = await refreshAccessToken(refreshToken);
    if (refreshed) upstream = await call(refreshed);
  }

  // 204/304 responses must not carry a body — passing one throws in the Response constructor.
  const status = upstream.status;
  const noBody = status === 204 || status === 304;
  const buf = noBody ? null : await upstream.arrayBuffer();
  const res = new NextResponse(buf, {
    status,
    headers: noBody
      ? undefined
      : { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });

  if (refreshed) {
    res.cookies.set("admin_at", refreshed, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: SEVEN_DAYS,
    });
  }
  return res;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
