"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminHeader, FormSheet, Field, CheckboxField, fieldClass } from "@/components/admin/form";
import { adminFetch } from "@/lib/admin-api.client";

interface ResumeVersion {
  id: string;
  version: string;
  label: string | null;
  s3Url: string;
  isDefault: boolean;
  downloadCount: number;
  createdAt: string;
}

export default function AdminResumePage() {
  const [items, setItems] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ResumeVersion | "new" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await adminFetch<{ data: ResumeVersion[] }>("resume/versions");
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
      version: String(f.get("version")),
      label: String(f.get("label") || "") || undefined,
      s3Url: String(f.get("s3Url")),
      isDefault: f.get("isDefault") === "on",
    };
    try {
      if (editing === "new") {
        await adminFetch("resume/versions", { method: "POST", body: JSON.stringify(body) });
      } else if (editing) {
        await adminFetch(`resume/versions/${editing.id}`, { method: "PUT", body: JSON.stringify(body) });
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function setDefault(v: ResumeVersion) {
    try {
      await adminFetch(`resume/versions/${v.id}/set-default`, { method: "POST" });
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed");
    }
  }

  async function onDelete(v: ResumeVersion) {
    if (!window.confirm(`Delete resume version "${v.version}"?`)) return;
    try {
      await adminFetch(`resume/versions/${v.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const cur = editing === "new" ? null : editing;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <AdminHeader title="Resume" description="Downloadable resume versions.">
        <Button onClick={() => setEditing("new")} className="gap-2">
          <Plus className="size-4" /> New version
        </Button>
      </AdminHeader>

      <div className="mt-8 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Version</th>
              <th className="px-4 py-2.5 font-medium">Label</th>
              <th className="px-4 py-2.5 font-medium">Downloads</th>
              <th className="px-4 py-2.5 font-medium">Default</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No versions yet.</td></tr>
            ) : (
              items.map((v) => (
                <tr key={v.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{v.version}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{v.label ?? "—"}</td>
                  <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{v.downloadCount}</td>
                  <td className="px-4 py-2.5">
                    {v.isDefault ? (
                      <span className="flex items-center gap-1 text-xs"><Star className="size-3 fill-current" /> Default</span>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setDefault(v)} className="h-7 text-xs">
                        Set default
                      </Button>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setEditing(v)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => onDelete(v)}>
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
          title={editing === "new" ? "New resume version" : `Edit ${cur?.version}`}
          onSubmit={onSubmit}
          submitting={submitting}
          error={error}
        >
          <Field label="Version" htmlFor="version" hint='e.g. "v2" or "2026-frontend".'>
            <input id="version" name="version" required defaultValue={cur?.version} className={fieldClass} />
          </Field>
          <Field label="Label" htmlFor="label">
            <input id="label" name="label" defaultValue={cur?.label ?? ""} className={fieldClass} />
          </Field>
          <Field label="File URL" htmlFor="s3Url" hint="Public URL to the PDF.">
            <input id="s3Url" name="s3Url" type="url" required defaultValue={cur?.s3Url ?? ""} className={fieldClass} />
          </Field>
          <CheckboxField label="Set as default" name="isDefault" defaultChecked={cur ? cur.isDefault : false} />
        </FormSheet>
      ) : null}
    </div>
  );
}
