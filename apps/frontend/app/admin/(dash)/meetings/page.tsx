"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/lib/admin-api.client";

interface Meeting {
  id: string;
  attendeeName: string;
  attendeeEmail: string;
  title: string | null;
  topic: string | null;
  startTime: string;
  meetingUrl: string | null;
  status: string;
  source: string | null;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminMeetingsPage() {
  const [items, setItems] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch<{ data: Meeting[] }>("meetings");
        setItems(res.data);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <AdminHeader title="Meetings" description="All booked calls (read-only mirror of Cal.com)." />

      <div className="mt-8 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Attendee</th>
              <th className="px-4 py-2.5 font-medium">Topic</th>
              <th className="px-4 py-2.5 font-medium">When</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No meetings.</td></tr>
            ) : (
              items.map((m) => (
                <tr key={m.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{m.attendeeName}</div>
                    <div className="text-xs text-muted-foreground">{m.attendeeEmail}</div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{m.title ?? m.topic ?? "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{fmt(m.startTime)}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs">{m.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {m.meetingUrl ? (
                      <a
                        href={m.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 text-xs")}
                      >
                        Join
                      </a>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
