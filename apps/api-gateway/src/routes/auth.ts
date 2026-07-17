import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/index.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { requireAuth } from '../middleware/auth.js';

// ============================================
// TOTP IMPORTS (COMMENTED FOR LATER)
// ============================================
// import { generateTOTPSecret, generateQRCode, verifyTOTP } from '../utils/totp.js';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

// ============================================
// TOTP SCHEMAS (COMMENTED FOR LATER)
// ============================================
/*
const verifyTOTPSchema = z.object({
  tempToken: z.string().min(1),
  code: z.string().length(6),
});

const setupTOTPSchema = z.object({
  password: z.string().min(8), // Require password to setup TOTP
});
*/

export async function authRoutes(app: FastifyInstance) {
  // ==========================================
  // POST /api/auth/login - Admin login
  // ==========================================
  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);

    // Find admin by email
    const admin = await prisma.adminCredential.findUnique({
      where: { email: body.email },
    });

    if (!admin) {
      reply.status(401);
      return {
        error: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      };
    }

    // Verify password
    const isValidPassword = await verifyPassword(body.password, admin.passwordHash);

    if (!isValidPassword) {
      reply.status(401);
      return {
        error: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      };
    }

    // ==========================================
    // TOTP VERIFICATION (COMMENTED FOR LATER)
    // ==========================================
    /*
    // If TOTP is enabled, require 2FA
    if (admin.totpSecret && admin.totpSecret !== 'NOT_CONFIGURED') {
      // Generate temporary token for TOTP verification
      const tempToken = app.jwt.sign(
        { 
          id: admin.id, 
          email: admin.email,
          requiresTOTP: true,
        },
        { expiresIn: '5m' } // Short expiry for TOTP step
      );

      return {
        requiresTOTP: true,
        tempToken,
        message: 'Please provide TOTP code',
      };
    }
    */

    // Generate tokens (no TOTP required)
    const accessToken = app.jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: 'admin',
      },
      { expiresIn: '15m' }
    );

    const refreshToken = app.jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        type: 'refresh',
      },
      { expiresIn: '7d' }
    );

    // Update last login info
    await prisma.adminCredential.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: request.ip,
      },
    });

    return {
      data: {
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes in seconds
        admin: {
          id: admin.id,
          email: admin.email,
        },
      },
    };
  });

  // ==========================================
  // TOTP VERIFICATION ENDPOINT (COMMENTED FOR LATER)
  // ==========================================
  /*
  app.post('/verify-totp', async (request, reply) => {
    const body = verifyTOTPSchema.parse(request.body);

    try {
      // Verify temp token
      const decoded = app.jwt.verify<{
        id: string;
        email: string;
        requiresTOTP: boolean;
      }>(body.tempToken);

      if (!decoded.requiresTOTP) {
        reply.status(400);
        return {
          error: 'BAD_REQUEST',
          message: 'Invalid temp token',
        };
      }

      // Get admin TOTP secret
      const admin = await prisma.adminCredential.findUnique({
        where: { id: decoded.id },
      });

      if (!admin || !admin.totpSecret) {
        reply.status(401);
        return {
          error: 'UNAUTHORIZED',
          message: 'TOTP not configured',
        };
      }

      // Verify TOTP code
      const isValidTOTP = verifyTOTP(admin.totpSecret, body.code);

      if (!isValidTOTP) {
        reply.status(401);
        return {
          error: 'UNAUTHORIZED',
          message: 'Invalid TOTP code',
        };
      }

      // Generate full tokens
      const accessToken = app.jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          role: 'admin',
        },
        { expiresIn: '15m' }
      );

      const refreshToken = app.jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          type: 'refresh',
        },
        { expiresIn: '7d' }
      );

      // Update last login
      await prisma.adminCredential.update({
        where: { id: admin.id },
        data: {
          lastLoginAt: new Date(),
          lastLoginIp: request.ip,
        },
      });

      return {
        data: {
          accessToken,
          refreshToken,
          expiresIn: 900,
          admin: {
            id: admin.id,
            email: admin.email,
          },
        },
      };
    } catch (error) {
      reply.status(401);
      return {
        error: 'UNAUTHORIZED',
        message: 'Invalid or expired temp token',
      };
    }
  });
  */

  // ==========================================
  // POST /api/auth/refresh - Refresh access token
  // ==========================================
  app.post('/refresh', async (request, reply) => {
    const body = refreshTokenSchema.parse(request.body);

    try {
      // Verify refresh token
      const decoded = app.jwt.verify<{
        id: string;
        email: string;
        type: string;
      }>(body.refreshToken);

      if (decoded.type !== 'refresh') {
        reply.status(401);
        return {
          error: 'UNAUTHORIZED',
          message: 'Invalid refresh token',
        };
      }

      // Verify admin still exists
      const admin = await prisma.adminCredential.findUnique({
        where: { id: decoded.id },
      });

      if (!admin) {
        reply.status(401);
        return {
          error: 'UNAUTHORIZED',
          message: 'Admin not found',
        };
      }

      // Generate new access token
      const accessToken = app.jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          role: 'admin',
        },
        { expiresIn: '15m' }
      );

      return {
        data: {
          accessToken,
          expiresIn: 900,
        },
      };
    } catch (error) {
      reply.status(401);
      return {
        error: 'UNAUTHORIZED',
        message: 'Invalid or expired refresh token',
      };
    }
  });

  // ==========================================
  // GET /api/auth/me - Get current admin info
  // ==========================================
  app.get('/me', { preHandler: [requireAuth] }, async (request, reply) => {
    if (!request.user) {
      reply.status(401);
      return {
        error: 'UNAUTHORIZED',
        message: 'Not authenticated',
      };
    }

    const admin = await prisma.adminCredential.findUnique({
      where: { id: request.user.id },
      select: {
        id: true,
        email: true,
        lastLoginAt: true,
        lastLoginIp: true,
      },
    });

    if (!admin) {
      reply.status(404);
      return {
        error: 'NOT_FOUND',
        message: 'Admin not found',
      };
    }

    return {
      data: {
        ...admin,
        role: 'admin',
      },
    };
  });

  // ==========================================
  // POST /api/auth/logout - Logout (client-side)
  // ==========================================
  app.post('/logout', async (request, reply) => {
    // JWT is stateless, so logout is handled client-side
    // by deleting the tokens. This endpoint is for consistency.
    
    // In future, you could implement token blacklisting with Redis:
    // await redis.set(`blacklist:${token}`, '1', 'EX', tokenExpiry);

    return {
      message: 'Logged out successfully',
    };
  });

  // ==========================================
  // POST /api/auth/change-password - Change admin password
  // ==========================================
  app.post('/change-password', { preHandler: [requireAuth] }, async (request, reply) => {
    const schema = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8),
    });

    const body = schema.parse(request.body);

    if (!request.user) {
      reply.status(401);
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' };
    }

    const admin = await prisma.adminCredential.findUnique({
      where: { id: request.user.id },
    });

    if (!admin) {
      reply.status(404);
      return { error: 'NOT_FOUND', message: 'Admin not found' };
    }

    // Verify current password
    const isValid = await verifyPassword(body.currentPassword, admin.passwordHash);

    if (!isValid) {
      reply.status(401);
      return { error: 'UNAUTHORIZED', message: 'Current password is incorrect' };
    }

    // Hash new password and update
    const newHash = await hashPassword(body.newPassword);

    await prisma.adminCredential.update({
      where: { id: admin.id },
      data: { passwordHash: newHash },
    });

    return {
      message: 'Password changed successfully',
    };
  });

  // ==========================================
  // TOTP SETUP ENDPOINT (COMMENTED FOR LATER)
  // ==========================================
  /*
  app.post('/setup-totp', { preHandler: [requireAuth] }, async (request, reply) => {
    const body = setupTOTPSchema.parse(request.body);

    if (!request.user) {
      reply.status(401);
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' };
    }

    const admin = await prisma.adminCredential.findUnique({
      where: { id: request.user.id },
    });

    if (!admin) {
      reply.status(404);
      return { error: 'NOT_FOUND', message: 'Admin not found' };
    }

    // Verify password before setting up TOTP
    const isValid = await verifyPassword(body.password, admin.passwordHash);

    if (!isValid) {
      reply.status(401);
      return { error: 'UNAUTHORIZED', message: 'Password is incorrect' };
    }

    // Generate TOTP secret
    const { secret, otpauthUrl } = generateTOTPSecret(admin.email);

    // Generate QR code
    const qrCode = await generateQRCode(otpauthUrl);

    // Save secret (but don't enable until verified)
    await prisma.adminCredential.update({
      where: { id: admin.id },
      data: { totpSecret: secret },
    });

    return {
      data: {
        secret, // For manual entry
        qrCode, // Data URL for QR code image
        message: 'Scan QR code with authenticator app, then verify with /api/auth/confirm-totp',
      },
    };
  });

  // Confirm TOTP setup by verifying first code
  app.post('/confirm-totp', { preHandler: [requireAuth] }, async (request, reply) => {
    const body = z.object({ code: z.string().length(6) }).parse(request.body);

    if (!request.user) {
      reply.status(401);
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' };
    }

    const admin = await prisma.adminCredential.findUnique({
      where: { id: request.user.id },
    });

    if (!admin || !admin.totpSecret) {
      reply.status(400);
      return { error: 'BAD_REQUEST', message: 'TOTP not set up' };
    }

    const isValid = verifyTOTP(admin.totpSecret, body.code);

    if (!isValid) {
      reply.status(401);
      return { error: 'UNAUTHORIZED', message: 'Invalid TOTP code' };
    }

    return {
      message: 'TOTP enabled successfully',
    };
  });

  // Disable TOTP
  app.post('/disable-totp', { preHandler: [requireAuth] }, async (request, reply) => {
    const body = z.object({
      password: z.string().min(1),
      code: z.string().length(6),
    }).parse(request.body);

    if (!request.user) {
      reply.status(401);
      return { error: 'UNAUTHORIZED', message: 'Not authenticated' };
    }

    const admin = await prisma.adminCredential.findUnique({
      where: { id: request.user.id },
    });

    if (!admin) {
      reply.status(404);
      return { error: 'NOT_FOUND', message: 'Admin not found' };
    }

    // Verify password
    const isValidPassword = await verifyPassword(body.password, admin.passwordHash);

    if (!isValidPassword) {
      reply.status(401);
      return { error: 'UNAUTHORIZED', message: 'Password is incorrect' };
    }

    // Verify TOTP
    if (admin.totpSecret && admin.totpSecret !== 'NOT_CONFIGURED') {
      const isValidTOTP = verifyTOTP(admin.totpSecret, body.code);

      if (!isValidTOTP) {
        reply.status(401);
        return { error: 'UNAUTHORIZED', message: 'Invalid TOTP code' };
      }
    }

    // Disable TOTP
    await prisma.adminCredential.update({
      where: { id: admin.id },
      data: { totpSecret: 'NOT_CONFIGURED' },
    });

    return {
      message: 'TOTP disabled successfully',
    };
  });
  */
}
