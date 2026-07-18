import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/index.js';
import { requireAdmin } from '../middleware/auth.js';

const updateProfileSchema = z.object({
  name: z.string().optional().nullable(),
  headline: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  resumeUrl: z.string().url().optional().nullable(),
  socials: z.record(z.string(), z.string()).optional().nullable(),
});

export async function profileRoutes(app: FastifyInstance) {
  // GET /api/profile — public bio/links (singleton)
  app.get('/', async () => {
    const profile = await prisma.profile.findFirst();
    return { data: profile };
  });

  // PUT /api/profile — upsert the singleton (Admin only)
  app.put('/', { preHandler: [requireAdmin] }, async (request) => {
    const body = updateProfileSchema.parse(request.body);
    const data = { ...body, socials: body.socials ?? undefined } as Record<string, unknown>;

    const existing = await prisma.profile.findFirst();
    const profile = existing
      ? await prisma.profile.update({ where: { id: existing.id }, data })
      : await prisma.profile.create({ data });

    return { data: profile };
  });
}
