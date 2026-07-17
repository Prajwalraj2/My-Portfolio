// Thin client over the Cal.com v2 API. The gateway holds the cal_ key; tools/AI never
// see it. Cal.com owns availability, timezones, emails, reminders and meeting links.
// NOTE: Cal.com versions each endpoint separately via the `cal-api-version` header, so we
// pin the version per call (slots → 2024-09-04, bookings → 2024-08-13).
import { env } from '../config/env.js';

const SLOTS_VERSION = '2024-09-04';
const BOOKINGS_VERSION = '2024-08-13';

export class CalcomError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown) {
    super(`Cal.com API error ${status}`);
    this.name = 'CalcomError';
    this.status = status;
    this.body = body;
  }
}

export function isCalcomConfigured(): boolean {
  return Boolean(
    env.CALCOM_API_KEY && (env.CALCOM_EVENT_TYPE_ID || (env.CALCOM_USERNAME && env.CALCOM_EVENT_SLUG))
  );
}

function headers(version: string) {
  return {
    Authorization: `Bearer ${env.CALCOM_API_KEY}`,
    'cal-api-version': version,
    'Content-Type': 'application/json',
  };
}

// Identify our configured event type either by numeric id or eventTypeSlug + username.
function eventTypeQuery(): Record<string, string> {
  if (env.CALCOM_EVENT_TYPE_ID) return { eventTypeId: String(env.CALCOM_EVENT_TYPE_ID) };
  return { username: env.CALCOM_USERNAME!, eventTypeSlug: env.CALCOM_EVENT_SLUG! };
}
function eventTypeBody(): Record<string, unknown> {
  if (env.CALCOM_EVENT_TYPE_ID) return { eventTypeId: Number(env.CALCOM_EVENT_TYPE_ID) };
  return { eventTypeSlug: env.CALCOM_EVENT_SLUG, username: env.CALCOM_USERNAME };
}

async function call<T>(path: string, init: RequestInit, version: string): Promise<T> {
  const res = await fetch(`${env.CALCOM_API_BASE}${path}`, { ...init, headers: headers(version) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new CalcomError(res.status, json);
  return json as T;
}

// GET /v2/slots (cal-api-version 2024-09-04) → data keyed by date: { "2026-07-15": [{ start }] }
export async function getSlots(params: { startTime: string; endTime: string; timeZone?: string }) {
  const qs = new URLSearchParams({
    ...eventTypeQuery(),
    start: params.startTime,
    end: params.endTime,
  });
  if (params.timeZone) qs.set('timeZone', params.timeZone);

  const json = await call<{ data?: unknown }>(`/slots?${qs.toString()}`, { method: 'GET' }, SLOTS_VERSION);
  const data = (json as { data?: unknown }).data;
  // Tolerate both { slots: {date:[...]} } and { date:[...] } shapes.
  if (data && typeof data === 'object' && 'slots' in (data as object)) {
    return (data as { slots: unknown }).slots ?? {};
  }
  return data ?? {};
}

export interface CreateBookingInput {
  start: string; // ISO 8601 UTC
  name: string;
  email: string;
  timeZone: string;
  language?: string;
  topic?: string;
  source?: string;
}

// POST /v2/bookings → creates the booking + Google Meet link + confirmation emails.
export async function createBooking(input: CreateBookingInput) {
  const body = {
    start: input.start,
    attendee: {
      name: input.name,
      email: input.email,
      timeZone: input.timeZone,
      language: input.language ?? 'en',
    },
    ...eventTypeBody(),
    // Only force a location when explicitly configured; otherwise let Cal.com use the
    // event type's own default (avoids "integration not valid for event type" errors).
    ...(env.CALCOM_LOCATION_INTEGRATION
      ? { location: { type: 'integration', integration: env.CALCOM_LOCATION_INTEGRATION } }
      : {}),
    metadata: {
      ...(input.topic ? { topic: input.topic.slice(0, 500) } : {}),
      ...(input.source ? { source: input.source } : {}),
    },
  };
  const json = await call<{ data?: unknown }>(
    `/bookings`,
    { method: 'POST', body: JSON.stringify(body) },
    BOOKINGS_VERSION
  );
  return (json as { data?: CalBooking }).data ?? (json as CalBooking);
}

export async function cancelBooking(uid: string, reason?: string) {
  return call<{ data?: unknown }>(
    `/bookings/${uid}/cancel`,
    { method: 'POST', body: JSON.stringify({ cancellationReason: reason ?? 'Cancelled via portfolio' }) },
    BOOKINGS_VERSION
  );
}

export async function getEventTypes() {
  const qs = env.CALCOM_USERNAME ? `?username=${encodeURIComponent(env.CALCOM_USERNAME)}` : '';
  return call<unknown>(`/event-types${qs}`, { method: 'GET' }, BOOKINGS_VERSION);
}

// Loosely-typed Cal.com booking (shape varies by version — we extract defensively).
export interface CalBooking {
  id?: number | string;
  uid?: string;
  title?: string;
  start?: string;
  end?: string;
  status?: string;
  meetingUrl?: string;
  location?: string;
  attendees?: Array<{ name?: string; email?: string; timeZone?: string }>;
  references?: Array<{ type?: string; meetingUrl?: string }>;
  [k: string]: unknown;
}

// Best-effort extraction of the video link from a booking payload.
export function extractMeetingUrl(b: CalBooking): string | null {
  if (b.meetingUrl) return b.meetingUrl;
  if (typeof b.location === 'string' && b.location.startsWith('http')) return b.location;
  const ref = b.references?.find((r) => r.meetingUrl);
  return ref?.meetingUrl ?? null;
}
