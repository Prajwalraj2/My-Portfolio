// Admin login: exchange credentials for admin JWTs and stash them in httpOnly cookies.
// The browser never sees the tokens; the /api/admin/* proxy injects the Bearer server-side.
import { type NextRequest, NextResponse } from "next/server";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8000";
const isProd = process.env.NODE_ENV === "production";
const SEVEN_DAYS = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  const body = await request.text();

  const upstream = await fetch(`${API_INTERNAL_URL}/api/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const json = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    return NextResponse.json(
      { message: json?.message ?? "Login failed" },
      { status: upstream.status }
    );
  }

  const data = json?.data;
  if (!data?.accessToken || !data?.refreshToken) {
    return NextResponse.json({ message: "Unexpected login response" }, { status: 502 });
  }

  const res = NextResponse.json({ ok: true, admin: data.admin });
  // Cookie lifetime tracks the refresh token (7d); the access JWT inside is short-lived and
  // renewed by the proxy on 401. Keeping the cookie present lets the guard allow the request
  // through so the refresh can happen.
  const opts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
    maxAge: SEVEN_DAYS,
  };
  res.cookies.set("admin_at", data.accessToken, opts);
  res.cookies.set("admin_rt", data.refreshToken, opts);
  return res;
}
