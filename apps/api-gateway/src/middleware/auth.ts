import { FastifyRequest, FastifyReply } from 'fastify';
import '../types/fastify.d.js';

// Middleware to require authentication
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.status(401).send({
        error: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header',
      });
      return;
    }

    // Verify JWT token - this sets request.user
    await request.jwtVerify();
  } catch (error) {
    reply.status(401).send({
      error: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    });
  }
}

// Middleware to require admin role
export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // First, ensure user is authenticated
  await requireAuth(request, reply);
  
  // Check if response was already sent (auth failed)
  if (reply.sent) return;

  // Check admin role
  if (!request.user || request.user.role !== 'admin') {
    reply.status(403).send({
      error: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
}

// ============================================
// IP ALLOWLIST MIDDLEWARE (COMMENTED FOR LATER)
// ============================================

/*
import { prisma } from '@portfolio/database';

// Middleware to check IP allowlist for admin
export async function checkIPAllowlist(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.user) return;

  const clientIP = request.ip;
  
  // Get admin credentials to check allowed IPs
  const admin = await prisma.adminCredential.findUnique({
    where: { email: request.user.email },
    select: { allowedIps: true },
  });

  if (!admin) {
    reply.status(403).send({
      error: 'FORBIDDEN',
      message: 'Admin not found',
    });
    return;
  }

  // If allowedIps is empty, allow all IPs
  if (admin.allowedIps.length === 0) return;

  // Check if client IP is in allowlist
  const isAllowed = admin.allowedIps.some(allowedIP => {
    // Support CIDR notation in the future
    return allowedIP === clientIP || allowedIP === '*';
  });

  if (!isAllowed) {
    reply.status(403).send({
      error: 'FORBIDDEN',
      message: `Access denied from IP: ${clientIP}`,
    });
  }
}
*/
