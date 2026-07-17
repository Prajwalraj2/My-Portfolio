import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { env } from '../config/env.js';
import { prisma } from '../db/index.js';
import { requireSession } from '../middleware/auth.js';

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(10000),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  session_id: z.string().nullable().optional(),
  time_zone: z.string().nullable().optional(),
});

// Save one completed turn (user + assistant) to a chat session.
const persistSchema = z.object({
  session_id: z.string().uuid().nullable().optional(),
  user_message: z.string().min(1).max(10000),
  assistant_message: z.string().min(1).max(20000),
});

function titleFrom(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > 60 ? `${clean.slice(0, 60)}…` : clean;
}

export const chatRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/chat/persist
   * Save a completed exchange (user + assistant) for the logged-in user. Creates a
   * new ChatSession on first turn (title from the first user message) and returns its id
   * so the client can keep appending. Website-session only — history is per-account.
   */
  fastify.post('/persist', { preHandler: requireSession }, async (request, reply) => {
    const parsed = persistSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .status(400)
        .send({ error: 'Validation Error', message: parsed.error.issues[0].message });
    }

    const userId = request.principal!.userId!;
    const { session_id, user_message, assistant_message } = parsed.data;

    // Reuse the session only if it exists AND belongs to the caller; otherwise start fresh.
    let session =
      session_id != null
        ? await prisma.chatSession.findUnique({ where: { id: session_id } })
        : null;
    if (!session || session.userId !== userId) {
      session = await prisma.chatSession.create({
        data: { userId, title: titleFrom(user_message), status: 'active' },
      });
    }

    await prisma.chatMessage.createMany({
      data: [
        { sessionId: session.id, role: 'user', content: user_message },
        { sessionId: session.id, role: 'assistant', content: assistant_message },
      ],
    });
    // Bumps updatedAt (@updatedAt) so recent chats sort to the top.
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { messageCount: { increment: 2 } },
    });

    return { data: { session_id: session.id, title: session.title } };
  });

  /**
   * GET /api/chat/sessions
   * List the caller's chat sessions, most recently active first.
   */
  fastify.get('/sessions', { preHandler: requireSession }, async (request) => {
    const userId = request.principal!.userId!;
    const sessions = await prisma.chatSession.findMany({
      where: { userId, status: 'active' },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, messageCount: true, updatedAt: true },
    });
    return { data: { sessions } };
  });

  /**
   * GET /api/chat/sessions/:id
   * Load a single conversation (owner-checked) with its messages in order.
   */
  fastify.get('/sessions/:id', { preHandler: requireSession }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.principal!.userId!;

    const session = await prisma.chatSession.findUnique({
      where: { id },
      select: { id: true, title: true, userId: true },
    });
    if (!session || session.userId !== userId) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Chat not found' });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: id, role: { in: ['user', 'assistant'] } },
      orderBy: { createdAt: 'asc' },
      select: { id: true, role: true, content: true, createdAt: true },
    });
    return { data: { id: session.id, title: session.title, messages } };
  });

  /**
   * PATCH /api/chat/sessions/:id — rename a conversation (owner-checked).
   */
  fastify.patch('/sessions/:id', { preHandler: requireSession }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.principal!.userId!;
    const parsed = z.object({ title: z.string().min(1).max(120) }).safeParse(request.body);
    if (!parsed.success) {
      return reply
        .status(400)
        .send({ error: 'Validation Error', message: parsed.error.issues[0].message });
    }

    const session = await prisma.chatSession.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!session || session.userId !== userId) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Chat not found' });
    }

    const updated = await prisma.chatSession.update({
      where: { id },
      data: { title: parsed.data.title.trim() },
      select: { id: true, title: true },
    });
    return { data: updated };
  });

  /**
   * DELETE /api/chat/sessions/:id — delete a conversation and its messages (owner-checked).
   */
  fastify.delete('/sessions/:id', { preHandler: requireSession }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.principal!.userId!;

    const session = await prisma.chatSession.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!session || session.userId !== userId) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Chat not found' });
    }

    // ChatMessage cascades on delete; any linked Inquiry.sessionId is set null.
    await prisma.chatSession.delete({ where: { id } });
    return { message: 'Chat deleted' };
  });

  /**
   * POST /api/chat/stream
   * Proxy streaming chat to AI service
   */
  fastify.post('/stream', async (request, reply) => {
    const parseResult = chatRequestSchema.safeParse(request.body);
    
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: parseResult.error.issues[0].message,
      });
    }

    const { messages, session_id, time_zone } = parseResult.data;

    try {
      const aiResponse = await fetch(`${env.AI_SERVICE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, session_id, time_zone }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        fastify.log.error({ status: aiResponse.status, error: errorText }, 'AI service error');
        return reply.status(aiResponse.status).send({
          error: 'AI Service Error',
          message: 'Failed to get response from AI service',
        });
      }

      // Set SSE headers
      reply.raw.setHeader('Content-Type', 'text/event-stream');
      reply.raw.setHeader('Cache-Control', 'no-cache');
      reply.raw.setHeader('Connection', 'keep-alive');
      reply.raw.setHeader('Access-Control-Allow-Origin', '*');

      // Pipe the stream from AI service to client
      if (aiResponse.body) {
        const reader = aiResponse.body.getReader();
        
        const pump = async (): Promise<void> => {
          const { done, value } = await reader.read();
          if (done) {
            reply.raw.end();
            return;
          }
          reply.raw.write(value);
          return pump();
        };

        await pump();
      } else {
        reply.raw.end();
      }

      return reply;
    } catch (error) {
      fastify.log.error({ error }, 'Chat stream error');
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to connect to AI service',
      });
    }
  });

  /**
   * POST /api/chat/complete
   * Proxy non-streaming chat to AI service
   */
  fastify.post('/complete', async (request, reply) => {
    const parseResult = chatRequestSchema.safeParse(request.body);
    
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: parseResult.error.issues[0].message,
      });
    }

    const { messages, session_id, time_zone } = parseResult.data;

    try {
      const aiResponse = await fetch(`${env.AI_SERVICE_URL}/chat/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, session_id, time_zone }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        fastify.log.error({ status: aiResponse.status, error: errorText }, 'AI service error');
        return reply.status(aiResponse.status).send({
          error: 'AI Service Error',
          message: 'Failed to get response from AI service',
        });
      }

      const data = await aiResponse.json();
      return reply.send(data);
    } catch (error) {
      fastify.log.error({ error }, 'Chat complete error');
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to connect to AI service',
      });
    }
  });

  /**
   * GET /api/chat/health
   * Check AI service health
   */
  fastify.get('/health', async (request, reply) => {
    try {
      const aiResponse = await fetch(`${env.AI_SERVICE_URL}/health`);
      
      if (!aiResponse.ok) {
        return reply.status(503).send({
          status: 'unhealthy',
          message: 'AI service is not responding',
        });
      }

      const data = await aiResponse.json();
      return reply.send({
        status: 'healthy',
        ai_service: data,
      });
    } catch (error) {
      return reply.status(503).send({
        status: 'unhealthy',
        message: 'Cannot connect to AI service',
      });
    }
  });
};
