"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api.client";

type Status = "idle" | "sending" | "sent" | "error";

const fieldClass =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    try {
      await apiFetch("email/contact", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: data.subject || undefined,
          message: data.message,
        }),
      });
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border p-6">
        <p className="font-medium">Message sent ✓</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Thanks — Prajwal will get back to you soon.
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => setStatus("idle")}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">Name</label>
          <input id="name" name="name" required className={fieldClass} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" required className={fieldClass} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="subject" className="text-sm font-medium">Subject</label>
        <input id="subject" name="subject" className={fieldClass} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="message" className="text-sm font-medium">Message</label>
        <textarea id="message" name="message" required rows={6} className={fieldClass} />
      </div>

      {status === "error" ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
