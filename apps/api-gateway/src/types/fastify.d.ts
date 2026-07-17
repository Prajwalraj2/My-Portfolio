import '@fastify/jwt';
import 'fastify';
import type { Principal } from '../auth/principal.js';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: string;
      email: string;
      role?: string;
      type?: string;
      requiresTOTP?: boolean;
    };
    user: {
      id: string;
      email: string;
      role: string;
    };
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    // Cached unified identity for the request (set by the auth middleware).
    // `undefined` = not yet resolved, `null` = resolved but unauthenticated.
    principal?: Principal | null;
  }
}
