import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { env } from '../config/env.js';
import { requireUser, requireAdmin, requireScopes } from '../middleware/auth.js';
import { SCOPES } from '../auth/scopes.js';
import { isCalcomConfigured } from '../services/calcom.service.js';
import * as booking from '../services/booking.service.js';

const slotsQuerySchema = z.object({
  startTime: z.string().min(1), // ISO date/datetime
  endTime: z.string().min(1),
  timeZone: z.string().optional(),
});

const createMeetingSchema = z.object({
  start: z.string().min(1), // ISO 8601 UTC of the chosen slot
  name: z.string().min(1),
  email: z.string().email(),
  timeZone: z.string().min(1),
  topic: z.string().max(500).optional(),
  language: z.string().optional(),
});

function calcomDisabled(reply: import('fastify').FastifyReply) {
  reply.status(503);
  return { error: 'CALCOM_DISABLED', message: 'Scheduling is not configured' };
}

export async function meetingRoutes(app: FastifyInstance) {
  // GET /api/meetings/slots — available slots (public; timezone-aware)
  app.get('/slots', async (request, reply) => {
    if (!isCalcomConfigured()) return calcomDisabled(reply);
    const query = slotsQuerySchema.parse(request.query);
    try {
      const slots = await booking.getAvailableSlots(query);
      return { data: { slots } };
    } catch (err) {
      request.log.error({ err }, 'Cal.com slots fetch failed');
      reply.status(502);
      return { error: 'CALCOM_ERROR', message: 'Failed to fetch availability' };
    }
  });

  // POST /api/meetings — book a meeting (logged-in user or API key with meetings:write)
  app.post(
    '/',
    { preHandler: [requireUser, requireScopes(SCOPES.meetingsWrite)] },
    async (request, reply) => {
      if (!isCalcomConfigured()) return calcomDisabled(reply);
      const body = createMeetingSchema.parse(request.body);
      const source = request.principal?.kind === 'apikey' ? 'mcp_client' : 'website';
      try {
        const meeting = await booking.createMeeting({ ...body, source }, request.principal);
        reply.status(201);
        return { data: meeting };
      } catch (err) {
        request.log.error({ err }, 'Cal.com booking failed');
        reply.status(502);
        return { error: 'CALCOM_ERROR', message: 'Failed to create booking' };
      }
    }
  );

  // GET /api/meetings — all meetings (admin)
  app.get('/', { preHandler: [requireAdmin] }, async (request) => {
    const query = z.object({ status: z.string().optional() }).parse(request.query);
    const meetings = await booking.listMeetings(query.status);
    return { data: meetings };
  });

  // GET /api/meetings/mine — caller's own meetings
  app.get('/mine', { preHandler: [requireUser] }, async (request) => {
    const meetings = await booking.listMyMeetings(request.principal!.userId!);
    return { data: meetings };
  });

  // POST /api/meetings/:uid/cancel
  app.post('/:uid/cancel', { preHandler: [requireUser] }, async (request, reply) => {
    if (!isCalcomConfigured()) return calcomDisabled(reply);
    const { uid } = request.params as { uid: string };
    const { reason } = z.object({ reason: z.string().optional() }).parse(request.body ?? {});
    try {
      await booking.cancelMeeting(uid, reason);
      return { message: 'Meeting cancelled' };
    } catch (err) {
      request.log.error({ err }, 'Cal.com cancel failed');
      reply.status(502);
      return { error: 'CALCOM_ERROR', message: 'Failed to cancel meeting' };
    }
  });

  // POST /api/meetings/webhook — Cal.com webhook (public; guarded by a URL token).
  // NOTE: exercised only once the gateway is publicly reachable (deploy / ngrok).
  app.post('/webhook', async (request, reply) => {
    const token = (request.query as { token?: string }).token;
    if (env.CALCOM_WEBHOOK_TOKEN && token !== env.CALCOM_WEBHOOK_TOKEN) {
      reply.status(401);
      return { error: 'UNAUTHORIZED', message: 'Invalid webhook token' };
    }
    try {
      await booking.handleWebhook(request.body as Parameters<typeof booking.handleWebhook>[0]);
    } catch (err) {
      request.log.error({ err }, 'Cal.com webhook handling failed');
    }
    return { received: true };
  });
}
