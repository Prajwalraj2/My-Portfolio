import type { FastifyInstance } from 'fastify';
import { requireAdmin } from '../middleware/auth.js';
import { getGithubData, isGithubConfigured } from '../services/github.service.js';

export async function githubRoutes(app: FastifyInstance) {
  // GET /api/github — curated public GitHub view (cached)
  app.get('/', async (request, reply) => {
    if (!isGithubConfigured()) {
      reply.status(503);
      return { error: 'GITHUB_DISABLED', message: 'GitHub integration is not configured' };
    }
    try {
      const data = await getGithubData();
      return { data };
    } catch (err) {
      request.log.error({ err }, 'GitHub fetch failed');
      reply.status(502);
      return { error: 'GITHUB_ERROR', message: 'Failed to fetch GitHub data' };
    }
  });

  // POST /api/github/refresh — bust the cache (admin only)
  app.post('/refresh', { preHandler: [requireAdmin] }, async (request, reply) => {
    if (!isGithubConfigured()) {
      reply.status(503);
      return { error: 'GITHUB_DISABLED', message: 'GitHub integration is not configured' };
    }
    const data = await getGithubData(true);
    return { data };
  });
}
