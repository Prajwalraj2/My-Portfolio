// Server-side session read (forwards the sid cookie to the gateway's /api/auth/me).
import { serverFetch } from "./api.server";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  emailVerified: boolean;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const json = await serverFetch<{ data: { user: SessionUser } }>("/api/auth/me", {
      auth: true,
      silent: true, // anon visitors legitimately 401 here — don't surface it as an error
    });
    return json.data.user;
  } catch {
    return null;
  }
}
