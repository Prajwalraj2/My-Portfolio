import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@portfolio/database';
import { requireAdmin } from '../middleware/auth.js';

// Validation schemas
const createResumeVersionSchema = z.object({
  version: z.string().min(1),
  label: z.string().optional().nullable(),
  s3Url: z.string().url(),
  isDefault: z.boolean().default(false),
});

const updateResumeVersionSchema = createResumeVersionSchema.partial();

const resumeParamsSchema = z.object({
  id: z.string().uuid(),
});

export async function resumeRoutes(app: FastifyInstance) {
  // GET /api/resume - Get default/current resume (public)
  app.get('/', async (request, reply) => {
    const resume = await prisma.resumeVersion.findFirst({
      where: { isDefault: true },
    });
    
    if (!resume) {
      // Fallback to latest version
      const latest = await prisma.resumeVersion.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      
      if (!latest) {
        reply.status(404);
        return {
          error: 'NOT_FOUND',
          message: 'No resume versions found',
        };
      }
      
      return { data: latest };
    }
    
    return { data: resume };
  });

  // GET /api/resume/download - Get download URL and increment counter
  app.get('/download', async (request, reply) => {
    const resume = await prisma.resumeVersion.findFirst({
      where: { isDefault: true },
    });
    
    if (!resume) {
      const latest = await prisma.resumeVersion.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      
      if (!latest) {
        reply.status(404);
        return {
          error: 'NOT_FOUND',
          message: 'No resume versions found',
        };
      }
      
      // Increment download count
      await prisma.resumeVersion.update({
        where: { id: latest.id },
        data: { downloadCount: { increment: 1 } },
      });
      
      return { 
        data: {
          url: latest.s3Url,
          version: latest.version,
          label: latest.label,
        },
      };
    }
    
    // Increment download count
    await prisma.resumeVersion.update({
      where: { id: resume.id },
      data: { downloadCount: { increment: 1 } },
    });
    
    return { 
      data: {
        url: resume.s3Url,
        version: resume.version,
        label: resume.label,
      },
    };
  });

  // GET /api/resume/versions - List all resume versions (Admin only)
  app.get('/versions', { preHandler: [requireAdmin] }, async (request, reply) => {
    const versions = await prisma.resumeVersion.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return { data: versions };
  });

  // GET /api/resume/stats - Get resume download statistics (Admin only)
  app.get('/stats', { preHandler: [requireAdmin] }, async (request, reply) => {
    const versions = await prisma.resumeVersion.findMany({
      select: {
        id: true,
        version: true,
        label: true,
        downloadCount: true,
        isDefault: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const totalDownloads = versions.reduce((sum, v) => sum + v.downloadCount, 0);
    
    return {
      data: {
        totalDownloads,
        versions,
      },
    };
  });

  // GET /api/resume/versions/:id - Get specific version (Admin only)
  app.get('/versions/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = resumeParamsSchema.parse(request.params);
    
    const resume = await prisma.resumeVersion.findUnique({
      where: { id: params.id },
    });
    
    if (!resume) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Resume version with id "${params.id}" not found`,
      };
    }
    
    return { data: resume };
  });

  // POST /api/resume/versions - Create a new resume version (Admin only)
  app.post('/versions', { preHandler: [requireAdmin] }, async (request, reply) => {
    const body = createResumeVersionSchema.parse(request.body);
    
    // If setting as default, unset other defaults
    if (body.isDefault) {
      await prisma.resumeVersion.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }
    
    const resume = await prisma.resumeVersion.create({
      data: body,
    });
    
    reply.status(201);
    return { data: resume };
  });

  // PUT /api/resume/versions/:id - Update a resume version (Admin only)
  app.put('/versions/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = resumeParamsSchema.parse(request.params);
    const body = updateResumeVersionSchema.parse(request.body);
    
    const existing = await prisma.resumeVersion.findUnique({
      where: { id: params.id },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Resume version with id "${params.id}" not found`,
      };
    }
    
    // If setting as default, unset other defaults
    if (body.isDefault && !existing.isDefault) {
      await prisma.resumeVersion.updateMany({
        where: { 
          isDefault: true,
          id: { not: params.id },
        },
        data: { isDefault: false },
      });
    }
    
    const resume = await prisma.resumeVersion.update({
      where: { id: params.id },
      data: body,
    });
    
    return { data: resume };
  });

  // POST /api/resume/versions/:id/set-default - Set as default version (Admin only)
  app.post('/versions/:id/set-default', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = resumeParamsSchema.parse(request.params);
    
    const existing = await prisma.resumeVersion.findUnique({
      where: { id: params.id },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Resume version with id "${params.id}" not found`,
      };
    }
    
    // Unset all defaults and set this one
    await prisma.resumeVersion.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
    
    const resume = await prisma.resumeVersion.update({
      where: { id: params.id },
      data: { isDefault: true },
    });
    
    return { data: resume };
  });

  // DELETE /api/resume/versions/:id - Delete a resume version (Admin only)
  app.delete('/versions/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const params = resumeParamsSchema.parse(request.params);
    
    const existing = await prisma.resumeVersion.findUnique({
      where: { id: params.id },
    });
    
    if (!existing) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: `Resume version with id "${params.id}" not found`,
      };
    }
    
    // Prevent deletion of default version
    if (existing.isDefault) {
      reply.status(409);
      return {
        error: 'CONFLICT',
        message: 'Cannot delete the default resume version. Set another version as default first.',
      };
    }
    
    await prisma.resumeVersion.delete({
      where: { id: params.id },
    });
    
    reply.status(204);
    return null;
  });
}
