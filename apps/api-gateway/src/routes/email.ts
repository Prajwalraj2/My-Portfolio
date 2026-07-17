import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { env } from '../config/env.js';
import { prisma } from '../db/index.js';
import { sendEmail, isEmailConfigured, escapeHtml } from '../services/email.service.js';

const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  subject: z.string().max(200).optional(),
  message: z.string().min(1).max(5000),
});

export async function emailRoutes(app: FastifyInstance) {
  // POST /api/email/contact — send a message to Prajwal (public; the send_email tool).
  // Per-key rate limiting still applies via the global hook if called with an API key.
  app.post('/contact', async (request, reply) => {
    const body = contactSchema.parse(request.body);

    if (!isEmailConfigured() || !env.PRAJWAL_NOTIFY_EMAIL) {
      reply.status(503);
      return { error: 'EMAIL_DISABLED', message: 'Contact email is not configured' };
    }

    const subject = body.subject ? `[Contact] ${body.subject}` : `[Contact] Message from ${body.name}`;
    const html = `<h3>New contact message</h3>
<p><b>From:</b> ${escapeHtml(body.name)} (${escapeHtml(body.email)})</p>
<p>${escapeHtml(body.message).replace(/\n/g, '<br>')}</p>`;

    const r = await sendEmail({ to: env.PRAJWAL_NOTIFY_EMAIL, subject, html, replyTo: body.email });
    await prisma.notificationLog
      .create({ data: { channel: 'email', kind: 'contact', status: r.ok ? 'sent' : 'failed', subject, error: r.error ?? null } })
      .catch(() => {});

    if (!r.ok) {
      request.log.error({ error: r.error }, 'Contact email failed');
      reply.status(502);
      return { error: 'EMAIL_ERROR', message: 'Failed to send your message' };
    }
    return { message: "Message sent — Prajwal will get back to you." };
  });
}
