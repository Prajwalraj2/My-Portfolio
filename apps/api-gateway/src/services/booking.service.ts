// Orchestrates meetings: calls Cal.com, mirrors the booking into our DB (for the admin
// dashboard + AI awareness), and notifies Prajwal. Routes stay thin.
import { prisma } from '../db/index.js';
import type { Principal } from '../auth/principal.js';
import * as calcom from './calcom.service.js';
import { notifyPrajwal } from './notify.service.js';

export function getAvailableSlots(params: { startTime: string; endTime: string; timeZone?: string }) {
  return calcom.getSlots(params);
}

export interface CreateMeetingInput {
  start: string;
  name: string;
  email: string;
  timeZone: string;
  topic?: string;
  language?: string;
  source?: string;
}

export async function createMeeting(input: CreateMeetingInput, principal?: Principal | null) {
  const booking = await calcom.createBooking(input);

  const startTime = new Date(booking.start ?? input.start);
  const meeting = await prisma.meeting.create({
    data: {
      calBookingId: booking.id != null ? String(booking.id) : null,
      calUid: booking.uid ?? null,
      userId: principal?.userId ?? null,
      attendeeName: input.name,
      attendeeEmail: input.email,
      attendeeTimeZone: input.timeZone,
      title: booking.title ?? null,
      topic: input.topic ?? null,
      startTime,
      endTime: booking.end ? new Date(booking.end) : null,
      meetingUrl: calcom.extractMeetingUrl(booking),
      status: (booking.status ?? 'accepted').toLowerCase(),
      source: input.source ?? 'agent',
      rawPayload: booking as object,
    },
  });

  await notifyPrajwal('meeting', `New meeting booked: ${input.name}`, [
    `Email: ${input.email}`,
    `When: ${startTime.toISOString()} (${input.timeZone})`,
    `Topic: ${input.topic ?? '—'}`,
    `Link: ${meeting.meetingUrl ?? '(pending)'}`,
  ]);

  return meeting;
}

export async function listMeetings(status?: string) {
  return prisma.meeting.findMany({
    where: status ? { status } : {},
    orderBy: { startTime: 'desc' },
    take: 100,
  });
}

export async function listMyMeetings(userId: string) {
  return prisma.meeting.findMany({
    where: { userId },
    orderBy: { startTime: 'desc' },
  });
}

export async function cancelMeeting(uid: string, reason?: string): Promise<void> {
  await calcom.cancelBooking(uid, reason);
  await prisma.meeting.updateMany({
    where: { calUid: uid },
    data: { status: 'cancelled' },
  });
}

// Upsert a mirror row from a Cal.com webhook (bookings made directly on Cal.com, e.g. via
// an embedded widget, that didn't go through our createMeeting path).
export async function handleWebhook(payload: {
  triggerEvent?: string;
  payload?: calcom.CalBooking & {
    attendees?: Array<{ name?: string; email?: string; timeZone?: string }>;
    startTime?: string;
    endTime?: string;
  };
}) {
  const trigger = payload.triggerEvent;
  const b = payload.payload;
  if (!b) return;

  const uid = b.uid ?? (b.id != null ? String(b.id) : null);
  if (!uid) return;

  if (trigger === 'BOOKING_CANCELLED') {
    await prisma.meeting.updateMany({ where: { calUid: uid }, data: { status: 'cancelled' } });
    return;
  }

  const attendee = b.attendees?.[0];
  const startTime = new Date(b.start ?? b.startTime ?? Date.now());

  await prisma.meeting.upsert({
    where: { calUid: uid },
    update: {
      status: (b.status ?? 'accepted').toLowerCase(),
      meetingUrl: calcom.extractMeetingUrl(b),
      rawPayload: b as object,
    },
    create: {
      calUid: uid,
      calBookingId: b.id != null ? String(b.id) : null,
      attendeeName: attendee?.name ?? 'Unknown',
      attendeeEmail: attendee?.email ?? 'unknown@example.com',
      attendeeTimeZone: attendee?.timeZone ?? null,
      title: b.title ?? null,
      startTime,
      endTime: b.end ? new Date(b.end) : b.endTime ? new Date(b.endTime) : null,
      meetingUrl: calcom.extractMeetingUrl(b),
      status: (b.status ?? 'accepted').toLowerCase(),
      source: 'calcom',
      rawPayload: b as object,
    },
  });

  if (trigger === 'BOOKING_CREATED') {
    await notifyPrajwal('meeting', `New meeting (via Cal.com): ${attendee?.name ?? 'Unknown'}`, [
      `Email: ${attendee?.email ?? '—'}`,
      `When: ${startTime.toISOString()}`,
    ]);
  }
}
