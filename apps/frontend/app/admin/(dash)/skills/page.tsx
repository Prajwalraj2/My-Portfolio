"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminHeader, FormSheet, Field, CheckboxField, fieldClass } from "@/components/admin/form";
import { adminFetch } from "@/lib/admin-api.client";

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  iconUrl: string | null;
  yearsExperience: number | null;
  isFeatured: boolean;
  displayOrder: number;
}

const CATEGORIES = ["frontend", "backend", "devops", "ai", "database", "other"] as const;

export default function AdminSkillsPage() {
  const [items, setItems] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Skill | "new" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await adminFetch<{ data: Skill[] }>("skills");
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
    const years = String(f.get("yearsExperience") || "");
    const body = {
      name: String(f.get("name")),
      category: String(f.get("category")),
      proficiency: Number(f.get("proficiency") || 50),
      iconUrl: String(f.get("iconUrl") || "") || undefined,
      yearsExperience: years ? Number(years) : undefined,
      isFeatured: f.get("isFeatured") === "on",
      displayOrder: Number(f.get("displayOrder") || 0),
    };
    try {
      if (editing === "new") {
        await adminFetch("skills", { method: "POST", body: JSON.stringify(body) });
      } else if (editing) {
        await adminFetch(`skills/${editing.id}`, { method: "PUT", body: JSON.stringify(body) });
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(s: Skill) {
    if (!window.confirm(`Delete skill "${s.name}"?`)) return;
    try {
      await adminFetch(`skills/${s.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const cur = editing === "new" ? null : editing;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <AdminHeader title="Skills" description="Your technical skills and proficiencies.">
        <Button onClick={() => setEditing("new")} className="gap-2">
          <Plus className="size-4" /> New skill
        </Button>
      </AdminHeader>

      <div className="mt-8 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 font-medium">Proficiency</th>
              <th className="px-4 py-2.5 font-medium">Featured</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No skills yet.</td></tr>
            ) : (
              items.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{s.name}</td>
                  <td className="px-4 py-2.5 capitalize text-muted-foreground">{s.category}</td>
                  <td className="px-4 py-2.5 tabular-nums">{s.proficiency}</td>
                  <td className="px-4 py-2.5">{s.isFeatured ? "Yes" : "No"}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setEditing(s)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => onDelete(s)}>
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
          title={editing === "new" ? "New skill" : `Edit ${cur?.name}`}
          onSubmit={onSubmit}
          submitting={submitting}
          error={error}
        >
          <Field label="Name" htmlFor="name">
            <input id="name" name="name" required defaultValue={cur?.name} className={fieldClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" htmlFor="category">
              <select id="category" name="category" defaultValue={cur?.category ?? "other"} className={fieldClass}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Proficiency (1–100)" htmlFor="proficiency">
              <input id="proficiency" name="proficiency" type="number" min={1} max={100} defaultValue={cur?.proficiency ?? 50} className={fieldClass} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Years experience" htmlFor="yearsExperience">
              <input id="yearsExperience" name="yearsExperience" type="number" step="0.5" defaultValue={cur?.yearsExperience ?? ""} className={fieldClass} />
            </Field>
            <Field label="Display order" htmlFor="displayOrder">
              <input id="displayOrder" name="displayOrder" type="number" defaultValue={cur?.displayOrder ?? 0} className={fieldClass} />
            </Field>
          </div>
          <Field label="Icon URL" htmlFor="iconUrl">
            <input id="iconUrl" name="iconUrl" type="url" defaultValue={cur?.iconUrl ?? ""} className={fieldClass} />
          </Field>
          <CheckboxField label="Featured" name="isFeatured" defaultChecked={cur ? cur.isFeatured : false} />
        </FormSheet>
      ) : null}
    </div>
  );
}
