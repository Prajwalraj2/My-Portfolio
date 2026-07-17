import type { FastifyInstance } from 'fastify';
import { getPortfolio } from '../services/portfolio.service.js';

export async function portfolioRoutes(app: FastifyInstance) {
  // GET /api/portfolio — one aggregate snapshot (profile + featured content + resume)
  app.get('/', async () => {
    const data = await getPortfolio();
    return { data };
  });
}
