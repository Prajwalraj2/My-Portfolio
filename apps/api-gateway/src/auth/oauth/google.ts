// Google OAuth client (via arctic). Returns null when not configured so the routes can
// respond 503 instead of crashing.
import { Google } from 'arctic';
import { env } from '../../config/env.js';
import type { OAuthProfile } from '../principal.js';

function redirectBase(): string {
  return env.OAUTH_REDIRECT_BASE ?? `${env.API_GATEWAY_URL}/api`;
}

export function getGoogleClient(): Google | null {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return null;
  return new Google(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${redirectBase()}/auth/google/callback`
  );
}

export const GOOGLE_SCOPES = ['openid', 'profile', 'email'];

export async function fetchGoogleProfile(accessToken: string): Promise<OAuthProfile> {
  const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Google userinfo failed: ${res.status}`);

  const p = (await res.json()) as {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
  };

  return {
    providerUserId: p.sub,
    email: p.email,
    name: p.name,
    avatarUrl: p.picture,
  };
}
