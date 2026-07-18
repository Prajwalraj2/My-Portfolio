import { NextResponse } from "next/server";

// Clear the admin cookies. JWTs are stateless, so this is purely client-side session end.
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("admin_at");
  res.cookies.delete("admin_rt");
  return res;
}
