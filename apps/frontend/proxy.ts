import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 renamed Middleware → Proxy. Optimistic auth guards (real validation happens in
// the layouts): user routes need a `sid` cookie; admin routes need an `admin_at` cookie.
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Admin console — guarded by the admin session cookie, except the login page itself.
  if (path.startsWith("/admin")) {
    if (path === "/admin/login") return NextResponse.next();
    if (!request.cookies.has("admin_at")) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Logged-in user area — guarded by the website session cookie.
  if (!request.cookies.has("sid")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/mcp/:path*",
    "/connect/:path*",
    "/services/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};
