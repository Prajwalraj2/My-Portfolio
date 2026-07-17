import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/index.js';
import { requireSession } from '../middleware/auth.js';
import { generateApiKey } from '../auth/apiKey.js';

const createSchema = z.object({
  name: z.string().min(1).max(60),
  scopes: z.array(z.string()).optional(),
  expiresInDays: z.number().int().positive().max(365).optional(),
  rateLimitPerHour: z.number().int().positive().max(10000).optional(),
});

export async function apiKeyRoutes(app: FastifyInstance) {
  // Managing keys requires a real website session (an API key cannot mint more keys).
  app.addHook('preHandler', requireSession);

  // POST /api/apikeys — create; returns the raw key ONCE.
  app.post('/', async (request, reply) => {
    const body = createSchema.parse(request.body);
    const userId = request.principal!.userId!;
    const { raw, hash, prefix } = generateApiKey();

    const expiresAt = body.expiresInDays
      ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const key = await prisma.apiKey.create({
      data: {
        userId,
        name: body.name,
        keyHash: hash,
        prefix,
        scopes: body.scopes ?? [],
        expiresAt,
        ...(body.rateLimitPerHour ? { rateLimitPerHour: body.rateLimitPerHour } : {}),
      },
    });

    reply.status(201);
    return {
      data: {
        id: key.id,
        name: key.name,
        key: raw, // shown once — never stored or returned again
        prefix: key.prefix,
        scopes: key.scopes,
        expiresAt: key.expiresAt,
        createdAt: key.createdAt,
      },
    };
  });

  // GET /api/apikeys — list caller's keys (metadata only, never the raw key).
  app.get('/', async (request) => {
    const userId = request.principal!.userId!;
    const keys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        prefix: true,
        scopes: true,
        rateLimitPerHour: true,
        lastUsedAt: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true,
      },
    });
    return { data: { keys } };
  });

  // DELETE /api/apikeys/:id — revoke.
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.principal!.userId!;

    const key = await prisma.apiKey.findUnique({ where: { id } });
    if (!key || key.userId !== userId) {
      reply.status(404);
      return { error: 'NOT_FOUND', message: 'API key not found' };
    }

    await prisma.apiKey.update({ where: { id }, data: { revokedAt: new Date() } });
    return { message: 'API key revoked' };
  });
}
