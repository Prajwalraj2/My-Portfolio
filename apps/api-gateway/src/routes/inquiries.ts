import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@portfolio/database';
import { requireAdmin } from '../middleware/auth.js';

// Validation schemas
const inquiryStatusEnum = z.enum(['new', 'read', 'replied', 'closed']);
const inquirySourceEnum = z.enum(['contact_form', 'agent', 'mcp_client']);

const createInquirySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional().nullable(),
  budget: z.string().optional().nullable(),
  timeline: z.string().optional().nullable(),
  projectType: z.string().optional().nullable(),
  description: z.string().min(10),
  techStack: z.array(z.string()).default([]),
  source: inquirySourceEnum.optional().nullable(),
});

const updateInquirySchema = z.object({
  status: inquiryStatusEnum.optional(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  company: z.string().optional().nullable(),
  budget: z.string().optional().nullable(),
  timeline: z.string().optional().nullable(),
  projectType: z.string().optional().nullable(),
  description: z.string().min(10).optional(),
  techStack: z.array(z.string()).optional(),
});

const inquiryParamsSchema = z.object({
  id: z.string().uuid(),
});

const getInquiriesQuerySchema = z.object({
  status: inquiryStatusEnum.optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function inquiryRoutes(app: FastifyInstance) {
  // GET /api/inquiries - List all inquiries (Admin only)
  app.get('/', { preHandler: [requireAdmin] }, async (request, reply) => {
    const query = getInquiriesQuerySchema.parse(request.query);
    
    const where: any = {};
    
    if (query.status) {
      where.status = query.status;
    }
    
    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.offset,
        take: query.limit,
      }),
      prisma.inquiry.count({ where }),
    ]);
    
    return {
      data: inquiries,
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        has_more: query.offset + query.limit < total,
      },
    };
  });

  // GET /api/inquiries/new - List new/unread inquiries (Admin only)
  app.get('/new', { preHandler: [requireAdmin] }, async (request, reply) => {
    const inquiries = await prisma.inquiry.findMany({
      where: { status: 'new' },
      orderBy: { createdAt: 'asc' },
    });
    
    return { 
      data: inquiries,
      count: inquiries.length,
    };
  });

  // GET /api/inquiries/stats - Get inquiry statistics (Admin only)
  app.get('/stats', { preHandler: [requireAdmin] }, async (request, reply) => {
    const [newCount, readCount, repliedCount, closedCount, total] = await Promise.all([
      prisma.inquiry.count({ where: { status: 'new' } }),
      prisma.inquiry.count({ where: { status: 'read' } }),
      prisma.inquiry.count({ where: { status: 'replied' } }),
      prisma.inquiry.count({ where: { status: 'closed' } }),
      prisma.inquiry.count(),
    ]);
    
    return {
      data: {
        new: newCount,
        read: readCount,
        replied: repliedCount,
        closed: closedCount,
        total,
      },
    };
  });

  // GET /api/inquiries/:id - Get single inquiry (Admin only)
  app.get('/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = inquiryParamsSchema.parse(request.params);
    
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: params.id },
      include: {
        chatSession: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
              take: 50,
            },
          },
        },
      },
    });
    
    if (!inquiry) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Inquiry with id "${params.id}" not found`,
      };
    }
    
    // Auto-mark as read if new
    if (inquiry.status === 'new') {
      await prisma.inquiry.update({
        where: { id: params.id },
        data: { status: 'read' },
      });
      inquiry.status = 'read';
    }
    
    return { data: inquiry };
  });

  // POST /api/inquiries - Submit a new inquiry (public - contact form)
  app.post('/', async (request, reply) => {
    const body = createInquirySchema.parse(request.body);
    
    // Get IP address from request
    const ipAddress = request.ip;
    
    const inquiry = await prisma.inquiry.create({
      data: {
        ...body,
        source: body.source || 'contact_form',
        ipAddress,
        status: 'new',
      },
    });
    
    reply.status(201);
    return { 
      data: inquiry,
      message: 'Thank you for your inquiry! I will get back to you soon.',
    };
  });

  // PUT /api/inquiries/:id - Update an inquiry (Admin only)
  app.put('/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = inquiryParamsSchema.parse(request.params);
    const body = updateInquirySchema.parse(request.body);
    
    const existing = await prisma.inquiry.findUnique({
      where: { id: params.id },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Inquiry with id "${params.id}" not found`,
      };
    }
    
    const inquiry = await prisma.inquiry.update({
      where: { id: params.id },
      data: body,
    });
    
    return { data: inquiry };
  });

  // POST /api/inquiries/:id/mark-replied - Mark inquiry as replied (Admin only)
  app.post('/:id/mark-replied', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = inquiryParamsSchema.parse(request.params);
    
    const existing = await prisma.inquiry.findUnique({
      where: { id: params.id },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Inquiry with id "${params.id}" not found`,
      };
    }
    
    const inquiry = await prisma.inquiry.update({
      where: { id: params.id },
      data: { status: 'replied' },
    });
    
    return { data: inquiry };
  });

  // POST /api/inquiries/:id/close - Close an inquiry (Admin only)
  app.post('/:id/close', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = inquiryParamsSchema.parse(request.params);
    
    const existing = await prisma.inquiry.findUnique({
      where: { id: params.id },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Inquiry with id "${params.id}" not found`,
      };
    }
    
    const inquiry = await prisma.inquiry.update({
      where: { id: params.id },
      data: { status: 'closed' },
    });
    
    return { data: inquiry };
  });

  // DELETE /api/inquiries/:id - Delete an inquiry (Admin only)
  app.delete('/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = inquiryParamsSchema.parse(request.params);
    
    const existing = await prisma.inquiry.findUnique({
      where: { id: params.id },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Inquiry with id "${params.id}" not found`,
      };
    }
    
    await prisma.inquiry.delete({
      where: { id: params.id },
    });
    
    reply.status(204);
    return null;
  });
}
