import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { generateState, generateCodeVerifier } from 'arctic';
import { prisma } from '../db/index.js';
import { env } from '../config/env.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import {
  createSession,
  setSessionCookie,
  clearSessionCookie,
  revokeSession,
  SESSION_COOKIE_NAME,
} from '../auth/session.js';
import { requireUser } from '../middleware/auth.js';
import { findOrCreateUserByEmail, linkOAuthAccount } from '../services/user.service.js';
import { getGoogleClient, fetchGoogleProfile, GOOGLE_SCOPES } from '../auth/oauth/google.js';
import { getGitHubClient, fetchGitHubProfile, GITHUB_SCOPES } from '../auth/oauth/github.js';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(80).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Public view of a user (never leak passwordHash).
type UserRow = { id: string; email: string; name: string | null; avatarUrl: string | null; role: string; emailVerified: boolean; createdAt: Date };
function publicUser(u: UserRow) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    avatarUrl: u.avatarUrl,
    role: u.role,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
  };
}

// --- short-lived cookies to carry OAuth state/PKCE across the redirect ---
function setOAuthCookies(reply: FastifyReply, provider: string, state: string, verifier?: string) {
  const opts = { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: 600 };
  reply.setCookie(`${provider}_oauth_state`, state, opts);
  if (verifier) reply.setCookie(`${provider}_oauth_verifier`, verifier, opts);
}
function readOAuthCookies(req: FastifyRequest, provider: string) {
  return {
    state: req.cookies?.[`${provider}_oauth_state`],
    verifier: req.cookies?.[`${provider}_oauth_verifier`],
  };
}
function clearOAuthCookies(reply: FastifyReply, provider: string) {
  reply.clearCookie(`${provider}_oauth_state`, { path: '/' });
  reply.clearCookie(`${provider}_oauth_verifier`, { path: '/' });
}

export async function userAuthRoutes(app: FastifyInstance) {
  // ---------- email / password ----------
  app.post('/signup', async (request, reply) => {
    const body = signupSchema.parse(request.body);

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      reply.status(409);
      return { error: 'CONFLICT', message: 'Email already registered' };
    }

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: { email: body.email, name: body.name, passwordHash },
    });

    const { token, expiresAt } = await createSession(user.id, request);
    setSessionCookie(reply, token, expiresAt);
    return { data: { user: publicUser(user) } };
  });

  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !user.passwordHash) {
      reply.status(401);
      return { error: 'UNAUTHORIZED', message: 'Invalid email or password' };
    }

    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) {
      reply.status(401);
      return { error: 'UNAUTHORIZED', message: 'Invalid email or password' };
    }

    const { token, expiresAt } = await createSession(user.id, request);
    setSessionCookie(reply, token, expiresAt);
    return { data: { user: publicUser(user) } };
  });

  app.post('/logout', async (request, reply) => {
    const sid = request.cookies?.[SESSION_COOKIE_NAME];
    if (sid) await revokeSession(sid);
    clearSessionCookie(reply);
    return { message: 'Logged out successfully' };
  });

  app.get('/me', { preHandler: [requireUser] }, async (request, reply) => {
    const userId = request.principal!.userId!;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      reply.status(404);
      return { error: 'NOT_FOUND', message: 'User not found' };
    }
    return { data: { user: publicUser(user) } };
  });

  // ---------- Google ----------
  app.get('/google', async (_request, reply) => {
    const google = getGoogleClient();
    if (!google) {
      reply.status(503);
      return { error: 'OAUTH_DISABLED', message: 'Google OAuth is not configured' };
    }
    const state = generateState();
    const verifier = generateCodeVerifier();
    const url = google.createAuthorizationURL(state, verifier, GOOGLE_SCOPES);
    setOAuthCookies(reply, 'google', state, verifier);
    return reply.redirect(url.toString());
  });

  app.get('/google/callback', async (request, reply) => {
    const google = getGoogleClient();
    if (!google) {
      reply.status(503);
      return { error: 'OAUTH_DISABLED', message: 'Google OAuth is not configured' };
    }
    const q = request.query as { code?: string; state?: string };
    const { state, verifier } = readOAuthCookies(request, 'google');

    if (!q.code || !q.state || !state || q.state !== state || !verifier) {
      reply.status(400);
      return { error: 'BAD_REQUEST', message: 'Invalid OAuth state' };
    }

    const tokens = await google.validateAuthorizationCode(q.code, verifier);
    const profile = await fetchGoogleProfile(tokens.accessToken());

    const user = await findOrCreateUserByEmail(profile);
    await linkOAuthAccount(user.id, 'google', profile.providerUserId);

    const { token, expiresAt } = await createSession(user.id, request);
    setSessionCookie(reply, token, expiresAt);
    clearOAuthCookies(reply, 'google');
    return reply.redirect(`${env.APP_URL}/dashboard`);
  });

  // ---------- GitHub (no PKCE) ----------
  app.get('/github', async (_request, reply) => {
    const github = getGitHubClient();
    if (!github) {
      reply.status(503);
      return { error: 'OAUTH_DISABLED', message: 'GitHub OAuth is not configured' };
    }
    const state = generateState();
    const url = github.createAuthorizationURL(state, GITHUB_SCOPES);
    setOAuthCookies(reply, 'github', state);
    return reply.redirect(url.toString());
  });

  app.get('/github/callback', async (request, reply) => {
    const github = getGitHubClient();
    if (!github) {
      reply.status(503);
      return { error: 'OAUTH_DISABLED', message: 'GitHub OAuth is not configured' };
    }
    const q = request.query as { code?: string; state?: string };
    const { state } = readOAuthCookies(request, 'github');

    if (!q.code || !q.state || !state || q.state !== state) {
      reply.status(400);
      return { error: 'BAD_REQUEST', message: 'Invalid OAuth state' };
    }

    const tokens = await github.validateAuthorizationCode(q.code);
    const profile = await fetchGitHubProfile(tokens.accessToken());

    if (!profile.email) {
      reply.status(400);
      return { error: 'NO_EMAIL', message: 'No verified email available from GitHub' };
    }

    const user = await findOrCreateUserByEmail(profile);
    await linkOAuthAccount(user.id, 'github', profile.providerUserId);

    const { token, expiresAt } = await createSession(user.id, request);
    setSessionCookie(reply, token, expiresAt);
    clearOAuthCookies(reply, 'github');
    return reply.redirect(`${env.APP_URL}/dashboard`);
  });
}
