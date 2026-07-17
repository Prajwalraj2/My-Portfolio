import type { FastifyRequest, FastifyReply } from 'fastify';
import { resolvePrincipal } from '../auth/resolve.js';
import type { Principal } from '../auth/principal.js';

// Resolve once per request and cache on req.principal.
async function attachPrincipal(req: FastifyRequest): Promise<Principal | null> {
  if (req.principal === undefined) {
    req.principal = await resolvePrincipal(req);
  }
  return req.principal;
}

function unauthorized(reply: FastifyReply) {
  reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Authentication required' });
}

function forbidden(reply: FastifyReply, message = 'Forbidden') {
  reply.status(403).send({ error: 'FORBIDDEN', message });
}

// Any authenticated principal (user session, api key, or admin).
export async function requireAuth(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const p = await attachPrincipal(req);
  if (!p) return unauthorized(reply);
}

// A logged-in end user — accepts BOTH a website session and an API key (both act as a user).
export async function requireUser(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const p = await attachPrincipal(req);
  if (!p || (p.kind !== 'user' && p.kind !== 'apikey')) return unauthorized(reply);
}

// A real website session only (NOT an api key) — for sensitive account actions like
// managing API keys. Prevents a key from minting more keys.
export async function requireSession(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const p = await attachPrincipal(req);
  if (!p || p.kind !== 'user') return unauthorized(reply);
}

// Admin only.
export async function requireAdmin(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const p = await attachPrincipal(req);
  if (!p) return unauthorized(reply);
  if (p.kind !== 'admin') return forbidden(reply, 'Admin access required');
}

// Enforce that an API-key principal carries the given scopes. User/admin bypass (full access).
// Used from Phase 2 when tool endpoints exist.
export function requireScopes(...scopes: string[]) {
  return async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const p = await attachPrincipal(req);
    if (!p || (p.kind !== 'user' && p.kind !== 'apikey')) return unauthorized(reply);
    if (p.kind === 'apikey') {
      const missing = scopes.filter((s) => !p.scopes.includes(s));
      if (missing.length) return forbidden(reply, `Missing scopes: ${missing.join(', ')}`);
    }
  };
}
