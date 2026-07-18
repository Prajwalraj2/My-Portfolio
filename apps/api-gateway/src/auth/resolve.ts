// The single function that turns ANY incoming credential into a normalized Principal.
// Order: API key (Bearer pk_) → user session cookie → admin JWT (Bearer <jwt>).
import type { FastifyRequest } from 'fastify';
import type { Principal } from './principal.js';
import { getSessionUser, SESSION_COOKIE_NAME } from './session.js';
import { loadValidApiKey, touchApiKey, API_KEY_PREFIX } from './apiKey.js';

export async function resolvePrincipal(req: FastifyRequest): Promise<Principal | null> {
  const authHeader = req.headers.authorization;
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  // 1. API key (local MCP / programmatic)
  if (bearer && bearer.startsWith(API_KEY_PREFIX)) {
    const key = await loadValidApiKey(bearer);
    if (!key) return null;
    void touchApiKey(key.id);
    return {
      kind: 'apikey',
      id: key.id,
      userId: key.userId,
      email: key.user.email,
      role: key.user.role,
      scopes: key.scopes,
      rateLimitPerHour: key.rateLimitPerHour,
    };
  }

  // 2. Admin JWT (existing admin flow). An explicit Authorization header is a stronger,
  // more intentional signal than an ambient cookie, so we check it BEFORE the session
  // cookie (otherwise a stale user cookie would shadow a valid admin token).
  // Verifying also sets req.user for the admin handlers.
  if (bearer) {
    try {
      const decoded = await req.jwtVerify<{ id: string; email: string; role?: string }>();
      if (decoded.role === 'admin') {
        return {
          kind: 'admin',
          id: decoded.id,
          email: decoded.email,
          role: 'admin',
          scopes: [],
        };
      }
    } catch {
      // Not a valid JWT — fall through to the cookie session.
    }
  }

  // 3. User session (website) — httpOnly cookie
  const sid = req.cookies?.[SESSION_COOKIE_NAME];
  if (sid) {
    const user = await getSessionUser(sid);
    if (user && user.isActive) {
      return {
        kind: 'user',
        id: user.id,
        userId: user.id,
        email: user.email,
        role: user.role,
        scopes: [],
      };
    }
  }

  return null;
}
