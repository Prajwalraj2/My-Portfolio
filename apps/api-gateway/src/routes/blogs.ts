import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/index.js';
import { requireAdmin } from '../middleware/auth.js';

const slugParams = z.object({ slug: z.string().min(1) });

const listQuerySchema = z.object({
  tag: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
  offset: z.coerce.number().min(0).default(0),
});

const createBlogSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  title: z.string().min(1),
  excerpt: z.string().optional().nullable(),
  contentMd: z.string().min(1),
  coverUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
});
const updateBlogSchema = createBlogSchema.partial();

export async function blogRoutes(app: FastifyInstance) {
  // GET /api/blogs — published blogs (public, paginated)
  app.get('/', async (request) => {
    const query = listQuerySchema.parse(request.query);
    const where = {
      status: 'published',
      ...(query.tag ? { tags: { has: query.tag } } : {}),
    };
    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: query.offset,
        take: query.limit,
        select: {
          id: true, slug: true, title: true, excerpt: true, coverUrl: true,
          tags: true, publishedAt: true, views: true, createdAt: true,
        },
      }),
      prisma.blog.count({ where }),
    ]);
    return {
      data: blogs,
      pagination: { total, limit: query.limit, offset: query.offset, has_more: query.offset + query.limit < total },
    };
  });

  // GET /api/blogs/all — all blogs incl. drafts (Admin only)
  app.get('/all', { preHandler: [requireAdmin] }, async (request) => {
    const query = listQuerySchema.parse(request.query);
    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({ orderBy: { createdAt: 'desc' }, skip: query.offset, take: query.limit }),
      prisma.blog.count(),
    ]);
    return {
      data: blogs,
      pagination: { total, limit: query.limit, offset: query.offset, has_more: query.offset + query.limit < total },
    };
  });

  // GET /api/blogs/:slug — single published blog (increments views)
  app.get('/:slug', async (request, reply) => {
    const { slug } = slugParams.parse(request.params);
    const blog = await prisma.blog.findUnique({ where: { slug } });
    if (!blog || blog.status !== 'published') {
      reply.status(404);
      return { error: 'NOT_FOUND', message: `Blog "${slug}" not found` };
    }
    await prisma.blog.update({ where: { slug }, data: { views: { increment: 1 } } }).catch(() => {});
    return { data: { ...blog, views: blog.views + 1 } };
  });

  // POST /api/blogs — create (Admin only)
  app.post('/', { preHandler: [requireAdmin] }, async (request, reply) => {
    const body = createBlogSchema.parse(request.body);
    const existing = await prisma.blog.findUnique({ where: { slug: body.slug } });
    if (existing) {
      reply.status(409);
      return { error: 'CONFLICT', message: `Blog "${body.slug}" already exists` };
    }
    const blog = await prisma.blog.create({
      data: { ...body, publishedAt: body.status === 'published' ? new Date() : null },
    });
    reply.status(201);
    return { data: blog };
  });

  // PUT /api/blogs/:slug — update (Admin only); publishing sets publishedAt once
  app.put('/:slug', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { slug } = slugParams.parse(request.params);
    const body = updateBlogSchema.parse(request.body);

    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (!existing) {
      reply.status(404);
      return { error: 'NOT_FOUND', message: `Blog "${slug}" not found` };
    }
    if (body.slug && body.slug !== slug) {
      const conflict = await prisma.blog.findUnique({ where: { slug: body.slug } });
      if (conflict) {
        reply.status(409);
        return { error: 'CONFLICT', message: `Blog "${body.slug}" already exists` };
      }
    }

    const data: Record<string, unknown> = { ...body };
    if (body.status === 'published' && existing.status !== 'published' && !existing.publishedAt) {
      data.publishedAt = new Date();
    }
    const blog = await prisma.blog.update({ where: { slug }, data });
    return { data: blog };
  });

  // DELETE /api/blogs/:slug — delete (Admin only)
  app.delete('/:slug', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { slug } = slugParams.parse(request.params);
    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (!existing) {
      reply.status(404);
      return { error: 'NOT_FOUND', message: `Blog "${slug}" not found` };
    }
    await prisma.blog.delete({ where: { slug } });
    reply.status(204);
    return null;
  });
}
