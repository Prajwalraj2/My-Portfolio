// Meeting tools — availability (public) + booking (needs a key with the meetings:write scope).
// Mirrors apps/ai-service/src/tools/action_tools.py.
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { gatewayGet, gatewayPost, unwrap } from "../gateway";
import { safe } from "../result";
import { formatSlots } from "../format";

const DEFAULT_TZ = "Asia/Kolkata";

export function registerMeetingTools(server: McpServer): void {
  server.tool(
    "get_meeting_slots",
    "Get Prajwal's available meeting slots for the next `daysAhead` days (default 14), shown in the given IANA `timeZone`. Call this the moment a user wants to meet, then present the returned times as options to pick from.",
    {
      timeZone: z
        .string()
        .optional()
        .describe("IANA timezone, e.g. 'America/New_York'. Defaults to Asia/Kolkata."),
      daysAhead: z
        .number()
        .int()
        .min(1)
        .max(60)
        .optional()
        .describe("How many days ahead to search. Default 14."),
    },
    ({ timeZone, daysAhead }) =>
      safe(async () => {
        const tz = timeZone || DEFAULT_TZ;
        const days = daysAhead ?? 14;
        const now = new Date();
        const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        const data = unwrap(
          await gatewayGet("/api/meetings/slots", {
            startTime: now.toISOString(),
            endTime: end.toISOString(),
            timeZone: tz,
          }),
          {}
        );
        return formatSlots(data, tz, days);
      })
  );

  server.tool(
    "book_meeting",
    "Book a meeting with Prajwal at a specific available slot. ONLY call after get_meeting_slots returned real slots, the user chose an exact time, and gave their name + email. `start` must be an ISO 8601 slot returned by get_meeting_slots.",
    {
      start: z.string().describe("ISO 8601 start time, exactly as returned by get_meeting_slots."),
      name: z.string().describe("Attendee's full name."),
      email: z.string().email().describe("Attendee's email — the confirmation and join link go here."),
      timeZone: z.string().describe("Attendee's IANA timezone."),
      topic: z.string().optional().describe("Short topic/agenda for the call."),
    },
    ({ start, name, email, timeZone, topic }) =>
      safe(async () => {
        const res = await gatewayPost("/api/meetings", {
          start,
          name,
          email,
          timeZone,
          topic: topic ?? "",
        });
        const m = unwrap(res, {}) as { startTime?: string };
        return `Meeting booked for ${m.startTime ?? start}. A confirmation email with the joining link was sent to ${email}.`;
      })
  );
}
