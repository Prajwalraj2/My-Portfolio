"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminHeader, FormSheet, Field, CheckboxField, fieldClass } from "@/components/admin/form";
import { adminFetch } from "@/lib/admin-api.client";

interface Experience {
  id: string;
  company: string;
  role: string;
  description: string | null;
  responsibilities: string[];
  techStack: string[];
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  companyUrl: string | null;
  companyLogoUrl: string | null;
  location: string | null;
  displayOrder: number;
}

const splitList = (v: string) => v.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
const dateVal = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : "");

export default function AdminExperiencePage() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Experience | "new" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await adminFetch<{ data: Experience[] }>("experience");
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
    const endDate = String(f.get("endDate") || "");
    const body = {
      company: String(f.get("company")),
      role: String(f.get("role")),
      description: String(f.get("description") || "") || undefined,
      responsibilities: splitList(String(f.get("responsibilities") || "")),
      techStack: splitList(String(f.get("techStack") || "")),
      startDate: String(f.get("startDate")),
      endDate: endDate || undefined,
      isCurrent: f.get("isCurrent") === "on",
      companyUrl: String(f.get("companyUrl") || "") || undefined,
      companyLogoUrl: String(f.get("companyLogoUrl") || "") || undefined,
      location: String(f.get("location") || "") || undefined,
      displayOrder: Number(f.get("displayOrder") || 0),
    };
    try {
      if (editing === "new") {
        await adminFetch("experience", { method: "POST", body: JSON.stringify(body) });
      } else if (editing) {
        await adminFetch(`experience/${editing.id}`, { method: "PUT", body: JSON.stringify(body) });
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(x: Experience) {
    if (!window.confirm(`Delete ${x.role} at ${x.company}?`)) return;
    try {
      await adminFetch(`experience/${x.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const cur = editing === "new" ? null : editing;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <AdminHeader title="Experience" description="Your work history.">
        <Button onClick={() => setEditing("new")} className="gap-2">
          <Plus className="size-4" /> New role
        </Button>
      </AdminHeader>

      <div className="mt-8 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Company</th>
              <th className="px-4 py-2.5 font-medium">Period</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No experience yet.</td></tr>
            ) : (
              items.map((x) => (
                <tr key={x.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{x.role}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{x.company}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {dateVal(x.startDate)} – {x.isCurrent ? "Present" : dateVal(x.endDate) || "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setEditing(x)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => onDelete(x)}>
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
          title={editing === "new" ? "New role" : `Edit ${cur?.role}`}
          onSubmit={onSubmit}
          submitting={submitting}
          error={error}
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Role" htmlFor="role">
              <input id="role" name="role" required defaultValue={cur?.role} className={fieldClass} />
            </Field>
            <Field label="Company" htmlFor="company">
              <input id="company" name="company" required defaultValue={cur?.company} className={fieldClass} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start date" htmlFor="startDate">
              <input id="startDate" name="startDate" type="date" required defaultValue={dateVal(cur?.startDate)} className={fieldClass} />
            </Field>
            <Field label="End date" htmlFor="endDate" hint="Leave blank if current.">
              <input id="endDate" name="endDate" type="date" defaultValue={dateVal(cur?.endDate)} className={fieldClass} />
            </Field>
          </div>
          <CheckboxField label="Current position" name="isCurrent" defaultChecked={cur ? cur.isCurrent : false} />
          <Field label="Description" htmlFor="description">
            <textarea id="description" name="description" rows={3} defaultValue={cur?.description ?? ""} className={fieldClass} />
          </Field>
          <Field label="Responsibilities" htmlFor="responsibilities" hint="One per line.">
            <textarea id="responsibilities" name="responsibilities" rows={4} defaultValue={cur?.responsibilities.join("\n") ?? ""} className={fieldClass} />
          </Field>
          <Field label="Tech stack" htmlFor="techStack" hint="Comma or newline separated.">
            <input id="techStack" name="techStack" defaultValue={cur?.techStack.join(", ") ?? ""} className={fieldClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Location" htmlFor="location">
              <input id="location" name="location" defaultValue={cur?.location ?? ""} className={fieldClass} />
            </Field>
            <Field label="Display order" htmlFor="displayOrder">
              <input id="displayOrder" name="displayOrder" type="number" defaultValue={cur?.displayOrder ?? 0} className={fieldClass} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company URL" htmlFor="companyUrl">
              <input id="companyUrl" name="companyUrl" type="url" defaultValue={cur?.companyUrl ?? ""} className={fieldClass} />
            </Field>
            <Field label="Company logo URL" htmlFor="companyLogoUrl">
              <input id="companyLogoUrl" name="companyLogoUrl" type="url" defaultValue={cur?.companyLogoUrl ?? ""} className={fieldClass} />
            </Field>
          </div>
        </FormSheet>
      ) : null}
    </div>
  );
}
