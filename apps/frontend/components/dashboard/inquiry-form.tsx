"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api.client";

const field =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function InquiryForm({ defaultName, defaultEmail }: { defaultName?: string; defaultEmail?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      await apiFetch("inquiries", {
        method: "POST",
        body: JSON.stringify({
          name: d.name,
          email: d.email,
          company: d.company || undefined,
          budget: d.budget || undefined,
          timeline: d.timeline || undefined,
          description: d.description,
          source: "contact_form",
        }),
      });
      setStatus("sent");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border p-6">
        <p className="font-medium">Inquiry sent ✓</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Prajwal has been notified and will reach out.
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => setStatus("idle")}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">Name</label>
          <input id="name" name="name" required defaultValue={defaultName} className={field} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" required defaultValue={defaultEmail} className={field} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="company" className="text-sm font-medium">Company</label>
          <input id="company" name="company" className={field} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="budget" className="text-sm font-medium">Budget</label>
          <input id="budget" name="budget" placeholder="$5k–10k" className={field} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="timeline" className="text-sm font-medium">Timeline</label>
        <input id="timeline" name="timeline" placeholder="e.g. 1–2 months" className={field} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="description" className="text-sm font-medium">What do you need?</label>
        <textarea id="description" name="description" required rows={6} minLength={10} className={field} />
      </div>

      {status === "error" ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send inquiry"}
      </Button>
    </form>
  );
}
