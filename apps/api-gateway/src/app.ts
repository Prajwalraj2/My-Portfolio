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
import { categoryRoutes } from './routes/categories.js';
import { projectRoutes } from './routes/projects.js';
import { skillRoutes } from './routes/skills.js';
import { experienceRoutes } from './routes/experience.js';
import { testimonialRoutes } from './routes/testimonials.js';
import { inquiryRoutes } from './routes/inquiries.js';
import { resumeRoutes } from './routes/resume.js';
import { chatRoutes } from './routes/chat.js';

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

  // Register routes
  await app.register(healthRoutes);
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(categoryRoutes, { prefix: '/api/categories' });
  await app.register(projectRoutes, { prefix: '/api/projects' });
  await app.register(skillRoutes, { prefix: '/api/skills' });
  await app.register(experienceRoutes, { prefix: '/api/experience' });
  await app.register(testimonialRoutes, { prefix: '/api/testimonials' });
  await app.register(inquiryRoutes, { prefix: '/api/inquiries' });
  await app.register(resumeRoutes, { prefix: '/api/resume' });
  await app.register(chatRoutes, { prefix: '/api/chat' });

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
