import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/index.js';
import { requireAdmin } from '../middleware/auth.js';

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  isVisible: z.boolean().default(true),
  displayOrder: z.number().default(0),
});

const updateCategorySchema = createCategorySchema.partial();

const categoryParamsSchema = z.object({
  slug: z.string().min(1),
});

export async function categoryRoutes(app: FastifyInstance) {
  // GET /api/categories - List all categories
  app.get('/', async (request, reply) => {
    const categories = await prisma.category.findMany({
      where: { isVisible: true },
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
    
    return { data: categories };
  });

  // GET /api/categories/all - List all categories (including hidden)
  app.get('/all', async (request, reply) => {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
    
    return { data: categories };
  });

  // GET /api/categories/:slug - Get single category with projects
  app.get('/:slug', async (request, reply) => {
    const params = categoryParamsSchema.parse(request.params);
    
    const category = await prisma.category.findUnique({
      where: { slug: params.slug },
      include: {
        projects: {
          where: { isPublished: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
    
    if (!category) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Category with slug "${params.slug}" not found`,
      };
    }
    
    return { data: category };
  });

  // POST /api/categories - Create a new category (Admin only)
  app.post('/', { preHandler: [requireAdmin] }, async (request, reply) => {
    const body = createCategorySchema.parse(request.body);
    
    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug: body.slug },
    });
    
    if (existing) {
      reply.status(409);
      return {
        error: 'CONFLICT',
        message: `Category with slug "${body.slug}" already exists`,
      };
    }
    
    const category = await prisma.category.create({
      data: body,
    });
    
    reply.status(201);
    return { data: category };
  });

  // PUT /api/categories/:slug - Update a category (Admin only)
  app.put('/:slug', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = categoryParamsSchema.parse(request.params);
    const body = updateCategorySchema.parse(request.body);
    
    const existing = await prisma.category.findUnique({
      where: { slug: params.slug },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Category with slug "${params.slug}" not found`,
      };
    }
    
    // If changing slug, check for conflicts
    if (body.slug && body.slug !== params.slug) {
      const slugConflict = await prisma.category.findUnique({
        where: { slug: body.slug },
      });
      
      if (slugConflict) {
        reply.status(409);
        return {
          error: 'CONFLICT',
          message: `Category with slug "${body.slug}" already exists`,
        };
      }
    }
    
    const category = await prisma.category.update({
      where: { slug: params.slug },
      data: body,
    });
    
    return { data: category };
  });

  // DELETE /api/categories/:slug - Delete a category (Admin only)
  app.delete('/:slug', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = categoryParamsSchema.parse(request.params);
    
    const existing = await prisma.category.findUnique({
      where: { slug: params.slug },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Category with slug "${params.slug}" not found`,
      };
    }
    
    // Prevent deletion if category has projects
    if (existing._count.projects > 0) {
      reply.status(409);
      return {
        error: 'CONFLICT',
        message: `Cannot delete category with ${existing._count.projects} projects. Move or delete projects first.`,
      };
    }
    
    await prisma.category.delete({
      where: { slug: params.slug },
    });
    
    reply.status(204);
    return null;
  });
}
