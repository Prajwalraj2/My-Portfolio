"use client";

import { useEffect, useState } from "react";
import { Check, X, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminHeader, FormSheet, Field, fieldClass } from "@/components/admin/form";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/lib/admin-api.client";

interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string | null;
  authorCompany: string | null;
  authorAvatarUrl: string | null;
  content: string;
  rating: number | null;
  status: "pending" | "approved" | "rejected";
  source: string | null;
  linkedinUrl: string | null;
  createdAt: string;
}

const STATUSES = ["all", "pending", "approved", "rejected"] as const;
type StatusFilter = (typeof STATUSES)[number];

const statusBadge: Record<string, string> = {
  pending: "bg-primary text-primary-foreground",
  approved: "bg-muted",
  rejected: "bg-muted text-muted-foreground",
};

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const q = filter === "all" ? "" : `&status=${filter}`;
      const res = await adminFetch<{ data: Testimonial[] }>(`testimonials/all?limit=50${q}`);
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

  async function moderate(id: string, action: "approve" | "reject") {
    try {
      await adminFetch(`testimonials/${id}/${action}`, { method: "POST" });
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Action failed");
    }
  }

  async function onDelete(t: Testimonial) {
    if (!window.confirm(`Delete testimonial from ${t.authorName}?`)) return;
    try {
      await adminFetch(`testimonials/${t.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const ratingRaw = String(f.get("rating") || "");
    const body = {
      authorName: String(f.get("authorName")),
      authorRole: String(f.get("authorRole") || "") || undefined,
      authorCompany: String(f.get("authorCompany") || "") || undefined,
      authorAvatarUrl: String(f.get("authorAvatarUrl") || "") || undefined,
      content: String(f.get("content")),
      rating: ratingRaw ? Number(ratingRaw) : undefined,
      linkedinUrl: String(f.get("linkedinUrl") || "") || undefined,
      status: String(f.get("status")) as Testimonial["status"],
    };
    try {
      await adminFetch(`testimonials/${editing.id}`, { method: "PUT", body: JSON.stringify(body) });
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <AdminHeader title="Testimonials" description="Approve, edit, or remove submitted testimonials." />

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)} className="capitalize">
            {s}
          </Button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No testimonials.</p>
        ) : (
          items.map((t) => (
            <div key={t.id} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t.authorName}</span>
                    <span className={cn("rounded px-1.5 py-0.5 text-xs", statusBadge[t.status])}>{t.status}</span>
                    {t.rating ? (
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Star className="size-3 fill-current" /> {t.rating}
                      </span>
                    ) : null}
                  </div>
                  {t.authorRole || t.authorCompany ? (
                    <p className="text-xs text-muted-foreground">
                      {[t.authorRole, t.authorCompany].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  {t.status !== "approved" ? (
                    <Button variant="ghost" size="icon-sm" aria-label="Approve" onClick={() => moderate(t.id, "approve")}>
                      <Check className="size-4" />
                    </Button>
                  ) : null}
                  {t.status !== "rejected" ? (
                    <Button variant="ghost" size="icon-sm" aria-label="Reject" onClick={() => moderate(t.id, "reject")}>
                      <X className="size-4" />
                    </Button>
                  ) : null}
                  <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setEditing(t)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => onDelete(t)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.content}</p>
            </div>
          ))
        )}
      </div>

      {editing !== null ? (
        <FormSheet
          open
          onOpenChange={(o) => !o && setEditing(null)}
          title={`Edit — ${editing.authorName}`}
          onSubmit={onSubmit}
          submitting={submitting}
          error={error}
        >
          <Field label="Author name" htmlFor="authorName">
            <input id="authorName" name="authorName" required defaultValue={editing.authorName} className={fieldClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Role" htmlFor="authorRole">
              <input id="authorRole" name="authorRole" defaultValue={editing.authorRole ?? ""} className={fieldClass} />
            </Field>
            <Field label="Company" htmlFor="authorCompany">
              <input id="authorCompany" name="authorCompany" defaultValue={editing.authorCompany ?? ""} className={fieldClass} />
            </Field>
          </div>
          <Field label="Content" htmlFor="content">
            <textarea id="content" name="content" required rows={5} minLength={10} defaultValue={editing.content} className={fieldClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rating (1–5)" htmlFor="rating">
              <input id="rating" name="rating" type="number" min={1} max={5} defaultValue={editing.rating ?? ""} className={fieldClass} />
            </Field>
            <Field label="Status" htmlFor="status">
              <select id="status" name="status" defaultValue={editing.status} className={fieldClass}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </Field>
          </div>
          <Field label="Avatar URL" htmlFor="authorAvatarUrl">
            <input id="authorAvatarUrl" name="authorAvatarUrl" type="url" defaultValue={editing.authorAvatarUrl ?? ""} className={fieldClass} />
          </Field>
          <Field label="LinkedIn URL" htmlFor="linkedinUrl">
            <input id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={editing.linkedinUrl ?? ""} className={fieldClass} />
          </Field>
        </FormSheet>
      ) : null}
    </div>
  );
}
