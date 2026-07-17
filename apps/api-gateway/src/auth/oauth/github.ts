// GitHub OAuth client (via arctic). GitHub does NOT use PKCE (no code verifier).
import { GitHub } from 'arctic';
import { env } from '../../config/env.js';
import type { OAuthProfile } from '../principal.js';

export function getGitHubClient(): GitHub | null {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) return null;
  const base = env.OAUTH_REDIRECT_BASE ?? `${env.API_GATEWAY_URL}/api`;
  return new GitHub(
    env.GITHUB_CLIENT_ID,
    env.GITHUB_CLIENT_SECRET,
    `${base}/auth/github/callback`
  );
}

export const GITHUB_SCOPES = ['read:user', 'user:email'];

const GH_HEADERS = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'prajwalraj-portfolio',
});

export async function fetchGitHubProfile(accessToken: string): Promise<OAuthProfile> {
  const userRes = await fetch('https://api.github.com/user', {
    headers: GH_HEADERS(accessToken),
  });
  if (!userRes.ok) throw new Error(`GitHub user failed: ${userRes.status}`);

  const u = (await userRes.json()) as {
    id: number;
    login: string;
    name?: string;
    avatar_url?: string;
    email?: string | null;
  };

  // GitHub often hides the primary email on /user; fetch it explicitly.
  let email = u.email ?? undefined;
  if (!email) {
    const emailRes = await fetch('https://api.github.com/user/emails', {
      headers: GH_HEADERS(accessToken),
    });
    if (emailRes.ok) {
      const emails = (await emailRes.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      const chosen = emails.find((e) => e.primary && e.verified) ?? emails.find((e) => e.verified);
      email = chosen?.email;
    }
  }

  return {
    providerUserId: String(u.id),
    email: email ?? '',
    name: u.name ?? u.login,
    avatarUrl: u.avatar_url,
  };
}
