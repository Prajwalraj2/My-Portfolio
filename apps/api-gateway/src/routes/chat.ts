import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { env } from '../config/env.js';

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(10000),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  session_id: z.string().nullable().optional(),
});

export const chatRoutes: FastifyPluginAsync = async (fastify) => {
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

    const { messages, session_id } = parseResult.data;

    try {
      const aiResponse = await fetch(`${env.AI_SERVICE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, session_id }),
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

    const { messages, session_id } = parseResult.data;

    try {
      const aiResponse = await fetch(`${env.AI_SERVICE_URL}/chat/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, session_id }),
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
