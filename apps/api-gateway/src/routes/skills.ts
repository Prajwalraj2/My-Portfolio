import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/index.js';
import { requireAdmin } from '../middleware/auth.js';

// Validation schemas
const skillCategoryEnum = z.enum(['frontend', 'backend', 'devops', 'ai', 'database', 'other']);

const createSkillSchema = z.object({
  name: z.string().min(1),
  category: skillCategoryEnum,
  proficiency: z.number().min(1).max(100).default(50),
  iconUrl: z.string().url().optional().nullable(),
  yearsExperience: z.number().positive().optional().nullable(),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().default(0),
});

const updateSkillSchema = createSkillSchema.partial();

const skillParamsSchema = z.object({
  id: z.string().uuid(),
});

const getSkillsQuerySchema = z.object({
  category: skillCategoryEnum.optional(),
  featured: z.coerce.boolean().optional(),
});

export async function skillRoutes(app: FastifyInstance) {
  // GET /api/skills - List all skills
  app.get('/', async (request, reply) => {
    const query = getSkillsQuerySchema.parse(request.query);
    
    const where: any = {};
    
    if (query.category) {
      where.category = query.category;
    }
    
    if (query.featured !== undefined) {
      where.isFeatured = query.featured;
    }
    
    const skills = await prisma.skill.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { displayOrder: 'asc' },
      ],
    });
    
    return { data: skills };
  });

  // GET /api/skills/featured - Get featured skills
  app.get('/featured', async (request, reply) => {
    const skills = await prisma.skill.findMany({
      where: { isFeatured: true },
      orderBy: { displayOrder: 'asc' },
    });
    
    return { data: skills };
  });

  // GET /api/skills/grouped - Get skills grouped by category
  app.get('/grouped', async (request, reply) => {
    const skills = await prisma.skill.findMany({
      orderBy: [
        { category: 'asc' },
        { displayOrder: 'asc' },
      ],
    });
    
    const grouped = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, typeof skills>);
    
    return { data: grouped };
  });

  // GET /api/skills/:id - Get single skill
  app.get('/:id', async (request, reply) => {
    const params = skillParamsSchema.parse(request.params);
    
    const skill = await prisma.skill.findUnique({
      where: { id: params.id },
    });
    
    if (!skill) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Skill with id "${params.id}" not found`,
      };
    }
    
    return { data: skill };
  });

  // POST /api/skills - Create a new skill (Admin only)
  app.post('/', { preHandler: [requireAdmin] }, async (request, reply) => {
    const body = createSkillSchema.parse(request.body);
    
    const skill = await prisma.skill.create({
      data: body,
    });
    
    reply.status(201);
    return { data: skill };
  });

  // PUT /api/skills/:id - Update a skill (Admin only)
  app.put('/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = skillParamsSchema.parse(request.params);
    const body = updateSkillSchema.parse(request.body);
    
    const existing = await prisma.skill.findUnique({
      where: { id: params.id },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Skill with id "${params.id}" not found`,
      };
    }
    
    const skill = await prisma.skill.update({
      where: { id: params.id },
      data: body,
    });
    
    return { data: skill };
  });

  // DELETE /api/skills/:id - Delete a skill (Admin only)
  app.delete('/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = skillParamsSchema.parse(request.params);
    
    const existing = await prisma.skill.findUnique({
      where: { id: params.id },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Skill with id "${params.id}" not found`,
      };
    }
    
    await prisma.skill.delete({
      where: { id: params.id },
    });
    
    reply.status(204);
    return null;
  });
}
