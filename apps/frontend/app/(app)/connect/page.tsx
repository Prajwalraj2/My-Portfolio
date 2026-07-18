import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMyMeetings } from "@/lib/fetchers";
import type { Meeting } from "@/types/api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Meetings" };

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function ConnectPage() {
  let meetings: Meeting[] = [];
  try {
    meetings = await getMyMeetings();
  } catch {
    meetings = [];
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Meetings</h1>
      <p className="mt-1 text-muted-foreground">
        Book a call with Prajwal, or see your upcoming meetings.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="https://cal.com/prajwalraj/30min"
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants())}
        >
          Book a call
        </a>
        <a href="/chatfeatures" className={cn(buttonVariants({ variant: "outline" }))}>
          Book via Lisa
        </a>
      </div>

      <div className="mt-10">
        <h2 className="mb-3 font-heading font-medium">Your meetings</h2>
        {meetings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No meetings yet. Book one above and it&apos;ll show up here.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {meetings.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-medium">{m.title ?? m.topic ?? "Meeting"}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {fmt(m.startTime)} · {m.status}
                  </p>
                </div>
                {m.meetingUrl ? (
                  <a
                    href={m.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Join
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
