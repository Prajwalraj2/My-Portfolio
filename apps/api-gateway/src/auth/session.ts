// Server-side (DB-backed) user sessions delivered via an httpOnly cookie.
// Revocable (real logout) and no token exposed to JS.
import crypto from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../db/index.js';
import { env } from '../config/env.js';

export const SESSION_COOKIE_NAME = 'sid';

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export async function createSession(userId: string, req: FastifyRequest) {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + env.SESSION_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] ?? null,
    },
  });

  return { token, expiresAt };
}

export async function getSessionUser(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    // Expired — clean it up, treat as no session.
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session.user;
}

export async function revokeSession(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export function setSessionCookie(reply: FastifyReply, token: string, expiresAt: Date) {
  reply.setCookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export function clearSessionCookie(reply: FastifyReply) {
  reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
}
