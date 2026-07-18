// Sends email via Resend's REST API (no SDK dependency). Test mode: `from` must be
// onboarding@resend.dev and `to` must be the Resend account's own email until a domain
// is verified. No-ops gracefully when unconfigured.
import { env } from '../config/env.js';

export function isEmailConfigured(): boolean {
  return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isEmailConfigured()) return { ok: false, error: 'email not configured' };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        reply_to: opts.replyTo,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
