"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminHeader, FormSheet, Field, fieldClass } from "@/components/admin/form";
import { adminFetch } from "@/lib/admin-api.client";

interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentMd: string;
  coverUrl: string | null;
  tags: string[];
  status: "draft" | "published";
  views: number;
}

const splitList = (v: string) => v.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);

export default function AdminBlogsPage() {
  const [items, setItems] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Blog | "new" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await adminFetch<{ data: Blog[] }>("blogs/all?limit=50");
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
      excerpt: String(f.get("excerpt") || "") || undefined,
      contentMd: String(f.get("contentMd")),
      coverUrl: String(f.get("coverUrl") || "") || undefined,
      tags: splitList(String(f.get("tags") || "")),
      status: String(f.get("status")) as "draft" | "published",
    };
    try {
      if (editing === "new") {
        await adminFetch("blogs", { method: "POST", body: JSON.stringify(body) });
      } else if (editing) {
        await adminFetch(`blogs/${editing.slug}`, { method: "PUT", body: JSON.stringify(body) });
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(b: Blog) {
    if (!window.confirm(`Delete blog "${b.title}"?`)) return;
    try {
      await adminFetch(`blogs/${b.slug}`, { method: "DELETE" });
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const cur = editing === "new" ? null : editing;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <AdminHeader title="Blogs" description="Long-form posts.">
        <Button onClick={() => setEditing("new")} className="gap-2">
          <Plus className="size-4" /> New post
        </Button>
      </AdminHeader>

      <div className="mt-8 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Title</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Views</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No posts yet.</td></tr>
            ) : (
              items.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{b.title}</div>
                    <div className="text-xs text-muted-foreground">{b.slug}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={b.status === "published" ? "rounded bg-muted px-1.5 py-0.5 text-xs" : "rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{b.views}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setEditing(b)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => onDelete(b)}>
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
          title={editing === "new" ? "New post" : `Edit ${cur?.title}`}
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
          <Field label="Excerpt" htmlFor="excerpt">
            <textarea id="excerpt" name="excerpt" rows={2} defaultValue={cur?.excerpt ?? ""} className={fieldClass} />
          </Field>
          <Field label="Content (Markdown)" htmlFor="contentMd">
            <textarea id="contentMd" name="contentMd" required rows={14} defaultValue={cur?.contentMd ?? ""} className={`${fieldClass} font-mono text-xs`} />
          </Field>
          <Field label="Cover image URL" htmlFor="coverUrl">
            <input id="coverUrl" name="coverUrl" type="url" defaultValue={cur?.coverUrl ?? ""} className={fieldClass} />
          </Field>
          <Field label="Tags" htmlFor="tags" hint="Comma or newline separated.">
            <input id="tags" name="tags" defaultValue={cur?.tags.join(", ") ?? ""} className={fieldClass} />
          </Field>
          <Field label="Status" htmlFor="status">
            <select id="status" name="status" defaultValue={cur?.status ?? "draft"} className={fieldClass}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
        </FormSheet>
      ) : null}
    </div>
  );
}
