"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminHeader, Field, fieldClass } from "@/components/admin/form";
import { adminFetch } from "@/lib/admin-api.client";

interface Profile {
  name: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  email: string | null;
  avatarUrl: string | null;
  resumeUrl: string | null;
  socials: Record<string, string> | null;
}

const SOCIAL_KEYS = ["github", "linkedin", "twitter", "website", "medium", "dockerhub"] as const;

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await adminFetch<{ data: Profile | null }>("profile");
      setProfile(res.data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setError(null);
    const f = new FormData(e.currentTarget);
    const socials: Record<string, string> = {};
    for (const k of SOCIAL_KEYS) {
      const v = String(f.get(`social_${k}`) || "").trim();
      if (v) socials[k] = v;
    }
    const body = {
      name: String(f.get("name") || "") || undefined,
      headline: String(f.get("headline") || "") || undefined,
      bio: String(f.get("bio") || "") || undefined,
      location: String(f.get("location") || "") || undefined,
      email: String(f.get("email") || "") || undefined,
      avatarUrl: String(f.get("avatarUrl") || "") || undefined,
      resumeUrl: String(f.get("resumeUrl") || "") || undefined,
      socials: Object.keys(socials).length ? socials : undefined,
    };
    try {
      await adminFetch("profile", { method: "PUT", body: JSON.stringify(body) });
      setMsg("Profile saved.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>;
  }

  const p = profile;
  return (
    <div className="mx-auto w-full max-w-2xl">
      <AdminHeader title="Profile" description="Your bio and links, shown across the site." />

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name">
            <input id="name" name="name" defaultValue={p?.name ?? ""} className={fieldClass} />
          </Field>
          <Field label="Location" htmlFor="location">
            <input id="location" name="location" defaultValue={p?.location ?? ""} className={fieldClass} />
          </Field>
        </div>
        <Field label="Headline" htmlFor="headline">
          <input id="headline" name="headline" defaultValue={p?.headline ?? ""} className={fieldClass} />
        </Field>
        <Field label="Bio" htmlFor="bio">
          <textarea id="bio" name="bio" rows={5} defaultValue={p?.bio ?? ""} className={fieldClass} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" htmlFor="email">
            <input id="email" name="email" type="email" defaultValue={p?.email ?? ""} className={fieldClass} />
          </Field>
          <Field label="Avatar URL" htmlFor="avatarUrl">
            <input id="avatarUrl" name="avatarUrl" type="url" defaultValue={p?.avatarUrl ?? ""} className={fieldClass} />
          </Field>
        </div>
        <Field label="Resume URL" htmlFor="resumeUrl">
          <input id="resumeUrl" name="resumeUrl" type="url" defaultValue={p?.resumeUrl ?? ""} className={fieldClass} />
        </Field>

        <div className="pt-2">
          <p className="mb-3 text-sm font-medium">Social links</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {SOCIAL_KEYS.map((k) => (
              <Field key={k} label={k[0].toUpperCase() + k.slice(1)} htmlFor={`social_${k}`}>
                <input
                  id={`social_${k}`}
                  name={`social_${k}`}
                  type="url"
                  defaultValue={p?.socials?.[k] ?? ""}
                  className={fieldClass}
                />
              </Field>
            ))}
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
          {msg ? <span className="text-sm text-muted-foreground">{msg}</span> : null}
        </div>
      </form>
    </div>
  );
}
