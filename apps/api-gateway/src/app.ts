import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';

import { env } from './config/env.js';

// Import routes
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { userAuthRoutes } from './routes/userAuth.js';
import { apiKeyRoutes } from './routes/apikeys.js';
import { categoryRoutes } from './routes/categories.js';
import { projectRoutes } from './routes/projects.js';
import { skillRoutes } from './routes/skills.js';
import { experienceRoutes } from './routes/experience.js';
import { testimonialRoutes } from './routes/testimonials.js';
import { inquiryRoutes } from './routes/inquiries.js';
import { resumeRoutes } from './routes/resume.js';
import { chatRoutes } from './routes/chat.js';
import { githubRoutes } from './routes/github.js';
import { meetingRoutes } from './routes/meetings.js';
import { profileRoutes } from './routes/profile.js';
import { portfolioRoutes } from './routes/portfolio.js';
import { guideRoutes } from './routes/guides.js';
import { blogRoutes } from './routes/blogs.js';
import { emailRoutes } from './routes/email.js';

import { resolvePrincipal } from './auth/resolve.js';
import { API_KEY_PREFIX } from './auth/apiKey.js';
import { consumeKeyRateLimit } from './auth/rateLimit.js';

export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV === 'production' 
      ? true 
      : {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          },
        },
  });

  // Register plugins
  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(','),
    credentials: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
  });

  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
  });

  await app.register(cookie);

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  // Per-key rate limiting: only kicks in for `Bearer pk_` (API key) requests — zero
  // overhead for everything else. Caches the resolved principal for downstream guards.
  app.addHook('preHandler', async (request, reply) => {
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ') || !auth.slice(7).startsWith(API_KEY_PREFIX)) return;

    const principal = await resolvePrincipal(request);
    request.principal = principal;

    if (principal?.kind === 'apikey') {
      const result = consumeKeyRateLimit(principal.id, principal.rateLimitPerHour ?? 120);
      if (!result.allowed) {
        reply.header('Retry-After', String(result.retryAfterSec));
        return reply.status(429).send({
          error: 'RATE_LIMITED',
          message: `API key rate limit exceeded. Retry in ${result.retryAfterSec}s.`,
        });
      }
    }
  });

  // Register routes
  await app.register(healthRoutes);
  await app.register(userAuthRoutes, { prefix: '/api/auth' });
  await app.register(apiKeyRoutes, { prefix: '/api/apikeys' });
  await app.register(authRoutes, { prefix: '/api/auth/admin' });
  await app.register(categoryRoutes, { prefix: '/api/categories' });
  await app.register(projectRoutes, { prefix: '/api/projects' });
  await app.register(skillRoutes, { prefix: '/api/skills' });
  await app.register(experienceRoutes, { prefix: '/api/experience' });
  await app.register(testimonialRoutes, { prefix: '/api/testimonials' });
  await app.register(inquiryRoutes, { prefix: '/api/inquiries' });
  await app.register(resumeRoutes, { prefix: '/api/resume' });
  await app.register(chatRoutes, { prefix: '/api/chat' });
  await app.register(githubRoutes, { prefix: '/api/github' });
  await app.register(meetingRoutes, { prefix: '/api/meetings' });
  await app.register(profileRoutes, { prefix: '/api/profile' });
  await app.register(portfolioRoutes, { prefix: '/api/portfolio' });
  await app.register(guideRoutes, { prefix: '/api/guides' });
  await app.register(blogRoutes, { prefix: '/api/blogs' });
  await app.register(emailRoutes, { prefix: '/api/email' });

  // Global error handler
  app.setErrorHandler((error: Error & { statusCode?: number }, request, reply) => {
    app.log.error({ err: error, url: request.url }, 'Request error');
    
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : error.message;
    
    reply.status(statusCode).send({
      error: error.name || 'Error',
      message,
      statusCode,
    });
  });

  return app;
}
