"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminHeader, FormSheet, Field, CheckboxField, fieldClass } from "@/components/admin/form";
import { adminFetch } from "@/lib/admin-api.client";

interface Project {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  longDescription: string | null;
  techStack: string[];
  categoryId: string;
  category?: { id: string; name: string };
  githubUrl: string | null;
  liveUrl: string | null;
  thumbnailUrl: string | null;
  images: string[];
  isFeatured: boolean;
  isPublished: boolean;
  displayOrder: number;
}
interface CategoryOption { id: string; name: string }

const splitList = (v: string) =>
  v.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);

export default function AdminProjectsPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | "new" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [proj, cats] = await Promise.all([
        adminFetch<{ data: Project[] }>("projects/all?limit=50"),
        adminFetch<{ data: CategoryOption[] }>("categories/all"),
      ]);
      setItems(proj.data);
      setCategories(cats.data);
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
      categoryId: String(f.get("categoryId")),
      description: String(f.get("description") || "") || undefined,
      longDescription: String(f.get("longDescription") || "") || undefined,
      techStack: splitList(String(f.get("techStack") || "")),
      githubUrl: String(f.get("githubUrl") || "") || undefined,
      liveUrl: String(f.get("liveUrl") || "") || undefined,
      thumbnailUrl: String(f.get("thumbnailUrl") || "") || undefined,
      images: splitList(String(f.get("images") || "")),
      displayOrder: Number(f.get("displayOrder") || 0),
      isFeatured: f.get("isFeatured") === "on",
      isPublished: f.get("isPublished") === "on",
    };
    try {
      if (editing === "new") {
        await adminFetch("projects", { method: "POST", body: JSON.stringify(body) });
      } else if (editing) {
        await adminFetch(`projects/${editing.slug}`, { method: "PUT", body: JSON.stringify(body) });
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(p: Project) {
    if (!window.confirm(`Delete project "${p.title}"?`)) return;
    try {
      await adminFetch(`projects/${p.slug}`, { method: "DELETE" });
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const cur = editing === "new" ? null : editing;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <AdminHeader title="Projects" description="Your portfolio work, grouped by category.">
        <Button onClick={() => setEditing("new")} disabled={categories.length === 0} className="gap-2">
          <Plus className="size-4" /> New project
        </Button>
      </AdminHeader>
      {categories.length === 0 && !loading ? (
        <p className="mt-4 text-sm text-muted-foreground">Create a category first.</p>
      ) : null}

      <div className="mt-8 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Title</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No projects yet.</td></tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{p.slug}</div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      <span className={p.isPublished ? "rounded bg-muted px-1.5 py-0.5 text-xs" : "rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"}>
                        {p.isPublished ? "Published" : "Draft"}
                      </span>
                      {p.isFeatured ? <span className="rounded bg-muted px-1.5 py-0.5 text-xs">Featured</span> : null}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setEditing(p)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => onDelete(p)}>
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
          title={editing === "new" ? "New project" : `Edit ${cur?.title}`}
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
          <Field label="Category" htmlFor="categoryId">
            <select id="categoryId" name="categoryId" required defaultValue={cur?.categoryId ?? ""} className={fieldClass}>
              <option value="" disabled>Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Short description" htmlFor="description">
            <textarea id="description" name="description" rows={2} defaultValue={cur?.description ?? ""} className={fieldClass} />
          </Field>
          <Field label="Long description" htmlFor="longDescription">
            <textarea id="longDescription" name="longDescription" rows={5} defaultValue={cur?.longDescription ?? ""} className={fieldClass} />
          </Field>
          <Field label="Tech stack" htmlFor="techStack" hint="Comma or newline separated.">
            <input id="techStack" name="techStack" defaultValue={cur?.techStack.join(", ") ?? ""} className={fieldClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="GitHub URL" htmlFor="githubUrl">
              <input id="githubUrl" name="githubUrl" type="url" defaultValue={cur?.githubUrl ?? ""} className={fieldClass} />
            </Field>
            <Field label="Live URL" htmlFor="liveUrl">
              <input id="liveUrl" name="liveUrl" type="url" defaultValue={cur?.liveUrl ?? ""} className={fieldClass} />
            </Field>
          </div>
          <Field label="Thumbnail URL" htmlFor="thumbnailUrl">
            <input id="thumbnailUrl" name="thumbnailUrl" type="url" defaultValue={cur?.thumbnailUrl ?? ""} className={fieldClass} />
          </Field>
          <Field label="Images" htmlFor="images" hint="One URL per line.">
            <textarea id="images" name="images" rows={3} defaultValue={cur?.images.join("\n") ?? ""} className={fieldClass} />
          </Field>
          <Field label="Display order" htmlFor="displayOrder">
            <input id="displayOrder" name="displayOrder" type="number" defaultValue={cur?.displayOrder ?? 0} className={fieldClass} />
          </Field>
          <div className="flex gap-6">
            <CheckboxField label="Published" name="isPublished" defaultChecked={cur ? cur.isPublished : true} />
            <CheckboxField label="Featured" name="isFeatured" defaultChecked={cur ? cur.isFeatured : false} />
          </div>
        </FormSheet>
      ) : null}
    </div>
  );
}
