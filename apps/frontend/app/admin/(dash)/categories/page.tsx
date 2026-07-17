"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminHeader, FormSheet, Field, CheckboxField, fieldClass } from "@/components/admin/form";
import { adminFetch } from "@/lib/admin-api.client";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  isVisible: boolean;
  displayOrder: number;
  _count?: { projects: number };
}

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await adminFetch<{ data: Category[] }>("categories/all");
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
      name: String(f.get("name")),
      slug: String(f.get("slug")),
      description: String(f.get("description") || "") || undefined,
      icon: String(f.get("icon") || "") || undefined,
      color: String(f.get("color") || "") || undefined,
      isVisible: f.get("isVisible") === "on",
      displayOrder: Number(f.get("displayOrder") || 0),
    };
    try {
      if (editing === "new") {
        await adminFetch("categories", { method: "POST", body: JSON.stringify(body) });
      } else if (editing) {
        await adminFetch(`categories/${editing.slug}`, { method: "PUT", body: JSON.stringify(body) });
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(c: Category) {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try {
      await adminFetch(`categories/${c.slug}`, { method: "DELETE" });
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const cur = editing === "new" ? null : editing;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <AdminHeader title="Categories" description="Project groupings shown on the site.">
        <Button onClick={() => setEditing("new")} className="gap-2">
          <Plus className="size-4" /> New category
        </Button>
      </AdminHeader>

      <div className="mt-8 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Slug</th>
              <th className="px-4 py-2.5 font-medium">Order</th>
              <th className="px-4 py-2.5 font-medium">Visible</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No categories yet.</td></tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{c.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{c.slug}</td>
                  <td className="px-4 py-2.5 tabular-nums">{c.displayOrder}</td>
                  <td className="px-4 py-2.5">{c.isVisible ? "Yes" : "No"}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setEditing(c)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => onDelete(c)}>
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
          title={editing === "new" ? "New category" : `Edit ${cur?.name}`}
          onSubmit={onSubmit}
          submitting={submitting}
          error={error}
        >
          <Field label="Name" htmlFor="name">
            <input id="name" name="name" required defaultValue={cur?.name} className={fieldClass} />
          </Field>
          <Field label="Slug" htmlFor="slug" hint="Lowercase, hyphens only.">
            <input id="slug" name="slug" required pattern="[a-z0-9-]+" defaultValue={cur?.slug} className={fieldClass} />
          </Field>
          <Field label="Description" htmlFor="description">
            <textarea id="description" name="description" rows={3} defaultValue={cur?.description ?? ""} className={fieldClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Icon" htmlFor="icon">
              <input id="icon" name="icon" defaultValue={cur?.icon ?? ""} className={fieldClass} />
            </Field>
            <Field label="Color" htmlFor="color">
              <input id="color" name="color" defaultValue={cur?.color ?? ""} className={fieldClass} />
            </Field>
          </div>
          <Field label="Display order" htmlFor="displayOrder">
            <input id="displayOrder" name="displayOrder" type="number" defaultValue={cur?.displayOrder ?? 0} className={fieldClass} />
          </Field>
          <CheckboxField label="Visible on the site" name="isVisible" defaultChecked={cur ? cur.isVisible : true} />
        </FormSheet>
      ) : null}
    </div>
  );
}
