import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/index.js';
import { requireAdmin } from '../middleware/auth.js';

const slugParams = z.object({ slug: z.string().min(1) });

const createGuideSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  title: z.string().min(1),
  summary: z.string().optional().nullable(),
  bodyMd: z.string().min(1),
  category: z.string().optional().nullable(),
  displayOrder: z.number().default(0),
  isPublished: z.boolean().default(true),
});
const updateGuideSchema = createGuideSchema.partial();

export async function guideRoutes(app: FastifyInstance) {
  // GET /api/guides — published guides (public)
  app.get('/', async () => {
    const guides = await prisma.guide.findMany({
      where: { isPublished: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return { data: guides };
  });

  // GET /api/guides/all — all guides incl. unpublished (Admin only)
  app.get('/all', { preHandler: [requireAdmin] }, async () => {
    const guides = await prisma.guide.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return { data: guides };
  });

  // GET /api/guides/:slug — single published guide
  app.get('/:slug', async (request, reply) => {
    const { slug } = slugParams.parse(request.params);
    const guide = await prisma.guide.findUnique({ where: { slug } });
    if (!guide || !guide.isPublished) {
      reply.status(404);
      return { error: 'NOT_FOUND', message: `Guide "${slug}" not found` };
    }
    return { data: guide };
  });

  // POST /api/guides — create (Admin only)
  app.post('/', { preHandler: [requireAdmin] }, async (request, reply) => {
    const body = createGuideSchema.parse(request.body);
    const existing = await prisma.guide.findUnique({ where: { slug: body.slug } });
    if (existing) {
      reply.status(409);
      return { error: 'CONFLICT', message: `Guide "${body.slug}" already exists` };
    }
    const guide = await prisma.guide.create({ data: body });
    reply.status(201);
    return { data: guide };
  });

  // PUT /api/guides/:slug — update (Admin only)
  app.put('/:slug', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { slug } = slugParams.parse(request.params);
    const body = updateGuideSchema.parse(request.body);

    const existing = await prisma.guide.findUnique({ where: { slug } });
    if (!existing) {
      reply.status(404);
      return { error: 'NOT_FOUND', message: `Guide "${slug}" not found` };
    }
    if (body.slug && body.slug !== slug) {
      const conflict = await prisma.guide.findUnique({ where: { slug: body.slug } });
      if (conflict) {
        reply.status(409);
        return { error: 'CONFLICT', message: `Guide "${body.slug}" already exists` };
      }
    }
    const guide = await prisma.guide.update({ where: { slug }, data: body });
    return { data: guide };
  });

  // DELETE /api/guides/:slug — delete (Admin only)
  app.delete('/:slug', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { slug } = slugParams.parse(request.params);
    const existing = await prisma.guide.findUnique({ where: { slug } });
    if (!existing) {
      reply.status(404);
      return { error: 'NOT_FOUND', message: `Guide "${slug}" not found` };
    }
    await prisma.guide.delete({ where: { slug } });
    reply.status(204);
    return null;
  });
}
