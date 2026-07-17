import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { notifyPrajwal } from '../services/notify.service.js';

// Validation schemas
const testimonialStatusEnum = z.enum(['pending', 'approved', 'rejected']);
const testimonialSourceEnum = z.enum(['agent', 'manual', 'website']);

const createTestimonialSchema = z.object({
  authorName: z.string().min(1),
  authorRole: z.string().optional().nullable(),
  authorCompany: z.string().optional().nullable(),
  authorAvatarUrl: z.string().url().optional().nullable(),
  content: z.string().min(10),
  rating: z.number().min(1).max(5).optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  source: testimonialSourceEnum.optional().nullable(),
});

const updateTestimonialSchema = createTestimonialSchema.partial().extend({
  status: testimonialStatusEnum.optional(),
});

const testimonialParamsSchema = z.object({
  id: z.string().uuid(),
});

const getTestimonialsQuerySchema = z.object({
  status: testimonialStatusEnum.optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export async function testimonialRoutes(app: FastifyInstance) {
  // GET /api/testimonials - List approved testimonials (public)
  app.get('/', async (request, reply) => {
    const query = getTestimonialsQuerySchema.parse(request.query);
    
    const where: any = {
      status: 'approved',
    };
    
    const [testimonials, total] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.offset,
        take: query.limit,
      }),
      prisma.testimonial.count({ where }),
    ]);
    
    return {
      data: testimonials,
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        has_more: query.offset + query.limit < total,
      },
    };
  });

  // GET /api/testimonials/all - List all testimonials (Admin only)
  app.get('/all', { preHandler: [requireAdmin] }, async (request, reply) => {
    const query = getTestimonialsQuerySchema.parse(request.query);
    
    const where: any = {};
    
    if (query.status) {
      where.status = query.status;
    }
    
    const [testimonials, total] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.offset,
        take: query.limit,
      }),
      prisma.testimonial.count({ where }),
    ]);
    
    return {
      data: testimonials,
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        has_more: query.offset + query.limit < total,
      },
    };
  });

  // GET /api/testimonials/pending - List pending testimonials (Admin only)
  app.get('/pending', { preHandler: [requireAdmin] }, async (request, reply) => {
    const testimonials = await prisma.testimonial.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
    });
    
    return { data: testimonials };
  });

  // GET /api/testimonials/:id - Get single testimonial
  app.get('/:id', async (request, reply) => {
    const params = testimonialParamsSchema.parse(request.params);
    
    const testimonial = await prisma.testimonial.findUnique({
      where: { id: params.id },
    });
    
    if (!testimonial) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Testimonial with id "${params.id}" not found`,
      };
    }
    
    return { data: testimonial };
  });

  // POST /api/testimonials - Submit a new testimonial
  app.post('/', async (request, reply) => {
    const body = createTestimonialSchema.parse(request.body);
    
    const testimonial = await prisma.testimonial.create({
      data: {
        ...body,
        status: 'pending',
      },
    });

    await notifyPrajwal('testimonial', `New testimonial from ${testimonial.authorName}`, [
      `Role: ${testimonial.authorRole ?? '—'}${testimonial.authorCompany ? ` @ ${testimonial.authorCompany}` : ''}`,
      `Rating: ${testimonial.rating ?? '—'}`,
      `Content: ${testimonial.content.slice(0, 300)}`,
      `Status: pending approval`,
    ]);

    reply.status(201);
    return {
      data: testimonial,
      message: 'Testimonial submitted successfully. It will be visible after approval.',
    };
  });

  // PUT /api/testimonials/:id - Update a testimonial (Admin only)
  app.put('/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = testimonialParamsSchema.parse(request.params);
    const body = updateTestimonialSchema.parse(request.body);
    
    const existing = await prisma.testimonial.findUnique({
      where: { id: params.id },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Testimonial with id "${params.id}" not found`,
      };
    }
    
    // If approving, set approvedAt
    const updateData: any = { ...body };
    if (body.status === 'approved' && existing.status !== 'approved') {
      updateData.approvedAt = new Date();
    }
    
    const testimonial = await prisma.testimonial.update({
      where: { id: params.id },
      data: updateData,
    });
    
    return { data: testimonial };
  });

  // POST /api/testimonials/:id/approve - Approve a testimonial (Admin only)
  app.post('/:id/approve', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = testimonialParamsSchema.parse(request.params);
    
    const existing = await prisma.testimonial.findUnique({
      where: { id: params.id },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Testimonial with id "${params.id}" not found`,
      };
    }
    
    const testimonial = await prisma.testimonial.update({
      where: { id: params.id },
      data: {
        status: 'approved',
        approvedAt: new Date(),
      },
    });
    
    return { data: testimonial };
  });

  // POST /api/testimonials/:id/reject - Reject a testimonial (Admin only)
  app.post('/:id/reject', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = testimonialParamsSchema.parse(request.params);
    
    const existing = await prisma.testimonial.findUnique({
      where: { id: params.id },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Testimonial with id "${params.id}" not found`,
      };
    }
    
    const testimonial = await prisma.testimonial.update({
      where: { id: params.id },
      data: { status: 'rejected' },
    });
    
    return { data: testimonial };
  });

  // DELETE /api/testimonials/:id - Delete a testimonial (Admin only)
  app.delete('/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = testimonialParamsSchema.parse(request.params);
    
    const existing = await prisma.testimonial.findUnique({
      where: { id: params.id },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Testimonial with id "${params.id}" not found`,
      };
    }
    
    await prisma.testimonial.delete({
      where: { id: params.id },
    });
    
    reply.status(204);
    return null;
  });
}
