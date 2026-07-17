"use client";

import { useEffect, useState } from "react";
import { Trash2, CheckCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { AdminHeader } from "@/components/admin/form";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/lib/admin-api.client";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  budget: string | null;
  timeline: string | null;
  projectType: string | null;
  description: string;
  techStack: string[];
  status: "new" | "read" | "replied" | "closed";
  source: string | null;
  createdAt: string;
}
interface ChatMsg { id: string; role: string; content: string }
interface InquiryDetail extends Inquiry {
  chatSession: { messages: ChatMsg[] } | null;
}

const STATUSES = ["all", "new", "read", "replied", "closed"] as const;
type StatusFilter = (typeof STATUSES)[number];

const badge = "rounded px-1.5 py-0.5 text-xs";

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<InquiryDetail | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const q = filter === "all" ? "" : `&status=${filter}`;
      const res = await adminFetch<{ data: Inquiry[] }>(`inquiries?limit=50${q}`);
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function openDetail(id: string) {
    try {
      const res = await adminFetch<{ data: InquiryDetail }>(`inquiries/${id}`);
      setDetail(res.data);
      // Opening auto-marks new→read on the server; reflect it in the list.
      setItems((prev) => prev.map((i) => (i.id === id && i.status === "new" ? { ...i, status: "read" } : i)));
    } catch {
      /* ignore */
    }
  }

  async function act(path: string, method: "POST" | "DELETE") {
    if (!detail) return;
    setBusy(true);
    try {
      await adminFetch(`inquiries/${detail.id}${path}`, { method });
      setDetail(null);
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <AdminHeader title="Inquiries" description="Messages from the contact form and Lisa." />

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
            className="capitalize"
          >
            {s}
          </Button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">From</th>
              <th className="px-4 py-2.5 font-medium">Company</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No inquiries.</td></tr>
            ) : (
              items.map((i) => (
                <tr
                  key={i.id}
                  onClick={() => openDetail(i.id)}
                  className="cursor-pointer hover:bg-muted/30"
                >
                  <td className="px-4 py-2.5">
                    <div className={cn("font-medium", i.status === "new" && "font-semibold")}>{i.name}</div>
                    <div className="text-xs text-muted-foreground">{i.email}</div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{i.company ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn(badge, i.status === "new" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                      {i.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{fmt(i.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Sheet open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-xl!">
          {detail ? (
            <>
              <SheetHeader className="border-b">
                <SheetTitle>{detail.name}</SheetTitle>
                <SheetDescription>
                  {detail.email}
                  {detail.source ? ` · via ${detail.source}` : ""}
                </SheetDescription>
              </SheetHeader>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  {([
                    ["Company", detail.company],
                    ["Budget", detail.budget],
                    ["Timeline", detail.timeline],
                    ["Project type", detail.projectType],
                  ] as const).map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs text-muted-foreground">{k}</p>
                      <p className="font-medium">{v || "—"}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Message</p>
                  <p className="mt-1 whitespace-pre-wrap">{detail.description}</p>
                </div>

                {detail.techStack?.length ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Tech</p>
                    <p className="mt-1">{detail.techStack.join(", ")}</p>
                  </div>
                ) : null}

                {detail.chatSession?.messages?.length ? (
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">Chat with Lisa</p>
                    <div className="space-y-2 rounded-lg border p-3">
                      {detail.chatSession.messages.map((m) => (
                        <p key={m.id} className="text-xs">
                          <span className="font-medium capitalize text-muted-foreground">{m.role}: </span>
                          {m.content}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <SheetFooter className="border-t">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" size="sm" disabled={busy} onClick={() => act("/mark-replied", "POST")} className="gap-1.5">
                    <CheckCheck className="size-4" /> Mark replied
                  </Button>
                  <Button variant="outline" size="sm" disabled={busy} onClick={() => act("/close", "POST")} className="gap-1.5">
                    <XCircle className="size-4" /> Close
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm("Delete this inquiry?")) void act("", "DELETE");
                    }}
                    className="gap-1.5 text-destructive"
                  >
                    <Trash2 className="size-4" /> Delete
                  </Button>
                </div>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
