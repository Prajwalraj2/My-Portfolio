import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@portfolio/database';
import { requireAdmin } from '../middleware/auth.js';

// Validation schemas
const createExperienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  description: z.string().optional().nullable(),
  responsibilities: z.array(z.string()).default([]),
  techStack: z.array(z.string()).default([]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  isCurrent: z.boolean().default(false),
  companyUrl: z.string().url().optional().nullable(),
  companyLogoUrl: z.string().url().optional().nullable(),
  location: z.string().optional().nullable(),
  displayOrder: z.number().default(0),
});

const updateExperienceSchema = createExperienceSchema.partial();

const experienceParamsSchema = z.object({
  id: z.string().uuid(),
});

export async function experienceRoutes(app: FastifyInstance) {
  // GET /api/experience - List all experience (sorted by date)
  app.get('/', async (request, reply) => {
    const experience = await prisma.experience.findMany({
      orderBy: [
        { isCurrent: 'desc' },
        { startDate: 'desc' },
      ],
    });
    
    return { data: experience };
  });

  // GET /api/experience/current - Get current position
  app.get('/current', async (request, reply) => {
    const current = await prisma.experience.findFirst({
      where: { isCurrent: true },
    });
    
    if (!current) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: 'No current position found',
      };
    }
    
    return { data: current };
  });

  // GET /api/experience/:id - Get single experience
  app.get('/:id', async (request, reply) => {
    const params = experienceParamsSchema.parse(request.params);
    
    const experience = await prisma.experience.findUnique({
      where: { id: params.id },
    });
    
    if (!experience) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Experience with id "${params.id}" not found`,
      };
    }
    
    return { data: experience };
  });

  // POST /api/experience - Create a new experience (Admin only)
  app.post('/', { preHandler: [requireAdmin] }, async (request, reply) => {
    const body = createExperienceSchema.parse(request.body);
    
    // If marking as current, unset other current positions
    if (body.isCurrent) {
      await prisma.experience.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      });
    }
    
    const experience = await prisma.experience.create({
      data: body,
    });
    
    reply.status(201);
    return { data: experience };
  });

  // PUT /api/experience/:id - Update an experience (Admin only)
  app.put('/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = experienceParamsSchema.parse(request.params);
    const body = updateExperienceSchema.parse(request.body);
    
    const existing = await prisma.experience.findUnique({
      where: { id: params.id },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Experience with id "${params.id}" not found`,
      };
    }
    
    // If marking as current, unset other current positions
    if (body.isCurrent) {
      await prisma.experience.updateMany({
        where: { 
          isCurrent: true,
          id: { not: params.id },
        },
        data: { isCurrent: false },
      });
    }
    
    const experience = await prisma.experience.update({
      where: { id: params.id },
      data: body,
    });
    
    return { data: experience };
  });

  // DELETE /api/experience/:id - Delete an experience (Admin only)
  app.delete('/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = experienceParamsSchema.parse(request.params);
    
    const existing = await prisma.experience.findUnique({
      where: { id: params.id },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Experience with id "${params.id}" not found`,
      };
    }
    
    await prisma.experience.delete({
      where: { id: params.id },
    });
    
    reply.status(204);
    return null;
  });
}
