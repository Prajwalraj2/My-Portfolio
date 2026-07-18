// Best-effort notifications to Prajwal via Slack and/or email. Never throws into the
// request path — a failed notification must not fail the user's action. Every attempt is
// recorded in NotificationLog. No-ops gracefully when a channel is unconfigured.
import { env } from '../config/env.js';
import { prisma } from '../db/index.js';
import { sendEmail, isEmailConfigured, escapeHtml } from './email.service.js';

type NotifyKind = 'inquiry' | 'meeting' | 'testimonial' | 'contact';

async function log(channel: 'slack' | 'email', kind: NotifyKind, status: string, subject: string, error?: string | null) {
  await prisma.notificationLog
    .create({ data: { channel, kind, status, subject, error: error ?? null } })
    .catch(() => {});
}

export async function notifyPrajwal(kind: NotifyKind, subject: string, lines: string[]): Promise<void> {
  // --- Slack ---
  if (env.SLACK_WEBHOOK_URL) {
    try {
      const res = await fetch(env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `*${subject}*\n${lines.join('\n')}` }),
      });
      await log('slack', kind, res.ok ? 'sent' : 'failed', subject, res.ok ? null : `Slack ${res.status}`);
    } catch (e) {
      await log('slack', kind, 'failed', subject, e instanceof Error ? e.message : String(e));
    }
  }

  // --- Email ---
  if (isEmailConfigured() && env.PRAJWAL_NOTIFY_EMAIL) {
    const html = `<h3>${escapeHtml(subject)}</h3><ul>${lines
      .map((l) => `<li>${escapeHtml(l)}</li>`)
      .join('')}</ul>`;
    const r = await sendEmail({ to: env.PRAJWAL_NOTIFY_EMAIL, subject, html });
    await log('email', kind, r.ok ? 'sent' : 'failed', subject, r.error);
  }
}
