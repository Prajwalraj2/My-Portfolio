import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@portfolio/database';
import { requireAdmin } from '../middleware/auth.js';

// Validation schemas
const getProjectsQuerySchema = z.object({
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
  offset: z.coerce.number().min(0).default(0),
});

const projectParamsSchema = z.object({
  slug: z.string().min(1),
});

const createProjectSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  techStack: z.array(z.string()).default([]),
  categoryId: z.string().uuid(),
  githubUrl: z.string().url().optional().nullable(),
  liveUrl: z.string().url().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  images: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  githubStars: z.number().default(0),
  githubForks: z.number().default(0),
  displayOrder: z.number().default(0),
});

const updateProjectSchema = createProjectSchema.partial();

export async function projectRoutes(app: FastifyInstance) {
  // GET /api/projects - List all projects
  app.get('/', async (request, reply) => {
    const query = getProjectsQuerySchema.parse(request.query);
    
    const where: any = {
      isPublished: true,
    };
    
    // Filter by category slug
    if (query.category) {
      where.category = {
        slug: query.category,
      };
    }
    
    // Filter by featured
    if (query.featured !== undefined) {
      where.isFeatured = query.featured;
    }
    
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            },
          },
        },
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: query.offset,
        take: query.limit,
      }),
      prisma.project.count({ where }),
    ]);
    
    return {
      data: projects,
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        has_more: query.offset + query.limit < total,
      },
    };
  });

  // GET /api/projects/all - List all projects (including unpublished)
  app.get('/all', async (request, reply) => {
    const query = getProjectsQuerySchema.parse(request.query);
    
    const where: any = {};
    
    if (query.category) {
      where.category = { slug: query.category };
    }
    
    if (query.featured !== undefined) {
      where.isFeatured = query.featured;
    }
    
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: { category: true },
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: query.offset,
        take: query.limit,
      }),
      prisma.project.count({ where }),
    ]);
    
    return {
      data: projects,
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        has_more: query.offset + query.limit < total,
      },
    };
  });

  // GET /api/projects/featured - Get featured projects
  app.get('/featured', async (request, reply) => {
    const projects = await prisma.project.findMany({
      where: {
        isFeatured: true,
        isPublished: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
    
    return { data: projects };
  });

  // GET /api/projects/:slug - Get single project
  app.get('/:slug', async (request, reply) => {
    const params = projectParamsSchema.parse(request.params);
    
    const project = await prisma.project.findUnique({
      where: { slug: params.slug },
      include: { category: true },
    });
    
    if (!project) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Project with slug "${params.slug}" not found`,
      };
    }
    
    return { data: project };
  });

  // POST /api/projects - Create a new project (Admin only)
  app.post('/', { preHandler: [requireAdmin] }, async (request, reply) => {
    const body = createProjectSchema.parse(request.body);
    
    // Check if slug already exists
    const existing = await prisma.project.findUnique({
      where: { slug: body.slug },
    });
    
    if (existing) {
      reply.status(409);
      return {
        error: 'CONFLICT',
        message: `Project with slug "${body.slug}" already exists`,
      };
    }
    
    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: body.categoryId },
    });
    
    if (!category) {
      reply.status(400);
      return {
        error: 'BAD_REQUEST',
        message: `Category with id "${body.categoryId}" not found`,
      };
    }
    
    const project = await prisma.project.create({
      data: body,
      include: { category: true },
    });
    
    reply.status(201);
    return { data: project };
  });

  // PUT /api/projects/:slug - Update a project (Admin only)
  app.put('/:slug', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = projectParamsSchema.parse(request.params);
    const body = updateProjectSchema.parse(request.body);
    
    const existing = await prisma.project.findUnique({
      where: { slug: params.slug },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Project with slug "${params.slug}" not found`,
      };
    }
    
    // If changing slug, check for conflicts
    if (body.slug && body.slug !== params.slug) {
      const slugConflict = await prisma.project.findUnique({
        where: { slug: body.slug },
      });
      
      if (slugConflict) {
        reply.status(409);
        return {
          error: 'CONFLICT',
          message: `Project with slug "${body.slug}" already exists`,
        };
      }
    }
    
    // If changing category, verify it exists
    if (body.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: body.categoryId },
      });
      
      if (!category) {
        reply.status(400);
        return {
          error: 'BAD_REQUEST',
          message: `Category with id "${body.categoryId}" not found`,
        };
      }
    }
    
    const project = await prisma.project.update({
      where: { slug: params.slug },
      data: body,
      include: { category: true },
    });
    
    return { data: project };
  });

  // DELETE /api/projects/:slug - Delete a project (Admin only)
  app.delete('/:slug', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = projectParamsSchema.parse(request.params);
    
    const existing = await prisma.project.findUnique({
      where: { slug: params.slug },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Project with slug "${params.slug}" not found`,
      };
    }
    
    await prisma.project.delete({
      where: { slug: params.slug },
    });
    
    reply.status(204);
    return null;
  });
}
