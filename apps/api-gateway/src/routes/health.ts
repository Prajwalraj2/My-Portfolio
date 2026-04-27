import { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  // Liveness probe - is the server running?
  app.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
    };
  });

  // Readiness probe - is the server ready to accept traffic?
  app.get('/ready', async (request, reply) => {
    // TODO: Add database and Redis health checks
    const checks = {
      database: true, // Placeholder - will check actual DB connection
      redis: true,    // Placeholder - will check actual Redis connection
    };

    const allHealthy = Object.values(checks).every(Boolean);

    if (!allHealthy) {
      reply.status(503);
    }

    return {
      status: allHealthy ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks,
    };
  });
}
