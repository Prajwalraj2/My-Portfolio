"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminHeader, FormSheet, Field, CheckboxField, fieldClass } from "@/components/admin/form";
import { adminFetch } from "@/lib/admin-api.client";

interface Guide {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  bodyMd: string;
  category: string | null;
  displayOrder: number;
  isPublished: boolean;
}

export default function AdminGuidesPage() {
  const [items, setItems] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Guide | "new" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await adminFetch<{ data: Guide[] }>("guides/all");
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const body = {
      title: String(f.get("title")),
      slug: String(f.get("slug")),
      summary: String(f.get("summary") || "") || undefined,
      bodyMd: String(f.get("bodyMd")),
      category: String(f.get("category") || "") || undefined,
      displayOrder: Number(f.get("displayOrder") || 0),
      isPublished: f.get("isPublished") === "on",
    };
    try {
      if (editing === "new") {
        await adminFetch("guides", { method: "POST", body: JSON.stringify(body) });
      } else if (editing) {
        await adminFetch(`guides/${editing.slug}`, { method: "PUT", body: JSON.stringify(body) });
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(g: Guide) {
    if (!window.confirm(`Delete guide "${g.title}"?`)) return;
    try {
      await adminFetch(`guides/${g.slug}`, { method: "DELETE" });
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const cur = editing === "new" ? null : editing;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <AdminHeader title="Guides" description="How-to content and references.">
        <Button onClick={() => setEditing("new")} className="gap-2">
          <Plus className="size-4" /> New guide
        </Button>
      </AdminHeader>

      <div className="mt-8 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Title</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 font-medium">Published</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No guides yet.</td></tr>
            ) : (
              items.map((g) => (
                <tr key={g.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{g.title}</div>
                    <div className="text-xs text-muted-foreground">{g.slug}</div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{g.category ?? "—"}</td>
                  <td className="px-4 py-2.5">{g.isPublished ? "Yes" : "No"}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setEditing(g)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => onDelete(g)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing !== null ? (
        <FormSheet
          open
          onOpenChange={(o) => !o && setEditing(null)}
          title={editing === "new" ? "New guide" : `Edit ${cur?.title}`}
          onSubmit={onSubmit}
          submitting={submitting}
          error={error}
        >
          <Field label="Title" htmlFor="title">
            <input id="title" name="title" required defaultValue={cur?.title} className={fieldClass} />
          </Field>
          <Field label="Slug" htmlFor="slug" hint="Lowercase, hyphens only.">
            <input id="slug" name="slug" required pattern="[a-z0-9-]+" defaultValue={cur?.slug} className={fieldClass} />
          </Field>
          <Field label="Summary" htmlFor="summary">
            <textarea id="summary" name="summary" rows={2} defaultValue={cur?.summary ?? ""} className={fieldClass} />
          </Field>
          <Field label="Body (Markdown)" htmlFor="bodyMd">
            <textarea id="bodyMd" name="bodyMd" required rows={14} defaultValue={cur?.bodyMd ?? ""} className={`${fieldClass} font-mono text-xs`} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" htmlFor="category">
              <input id="category" name="category" defaultValue={cur?.category ?? ""} className={fieldClass} />
            </Field>
            <Field label="Display order" htmlFor="displayOrder">
              <input id="displayOrder" name="displayOrder" type="number" defaultValue={cur?.displayOrder ?? 0} className={fieldClass} />
            </Field>
          </div>
          <CheckboxField label="Published" name="isPublished" defaultChecked={cur ? cur.isPublished : true} />
        </FormSheet>
      ) : null}
    </div>
  );
}
