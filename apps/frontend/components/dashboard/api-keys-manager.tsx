"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api.client";

interface ApiKeyRow {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  rateLimitPerHour: number;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

const inputClass =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ApiKeysManager() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await apiFetch<{ data: { keys: ApiKeyRow[] } }>("apikeys");
      setKeys(res.data.keys);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load keys");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || creating) return;
    setCreating(true);
    setError(null);
    setNewKey(null);
    try {
      const res = await apiFetch<{ data: { key: string } }>("apikeys", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      setNewKey(res.data.key);
      setName("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  }

  async function onRevoke(id: string) {
    if (!confirm("Revoke this key? Apps using it will stop working immediately.")) return;
    try {
      await apiFetch(`apikeys/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to revoke key");
    }
  }

  async function copyKey() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-8">
      {/* Create */}
      <form onSubmit={onCreate} className="rounded-xl border p-5">
        <h2 className="font-heading font-medium">Create a key</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Name it for the device or tool you&apos;ll use it in (e.g. &quot;Cursor laptop&quot;).
        </p>
        <div className="mt-4 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name"
            className={inputClass}
          />
          <Button type="submit" disabled={creating || !name.trim()}>
            {creating ? "Creating…" : "Create"}
          </Button>
        </div>
      </form>

      {/* Reveal-once */}
      {newKey ? (
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-5">
          <p className="text-sm font-medium">Copy your key now — you won&apos;t see it again.</p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 truncate rounded-md bg-background px-3 py-2 font-mono text-sm">
              {newKey}
            </code>
            <Button variant="outline" size="icon" onClick={copyKey} aria-label="Copy">
              {copied ? <Check /> : <Copy />}
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {/* List */}
      <div>
        <h2 className="mb-3 font-heading font-medium">Your keys</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : keys.length === 0 ? (
          <p className="text-sm text-muted-foreground">No keys yet.</p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {keys.map((k) => (
              <li key={k.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{k.name}</span>
                    {k.revokedAt ? (
                      <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive">
                        revoked
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">{k.prefix}…</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {k.scopes.length} scopes · {k.rateLimitPerHour}/hr ·{" "}
                    {k.lastUsedAt ? `last used ${new Date(k.lastUsedAt).toLocaleDateString()}` : "never used"}
                  </p>
                </div>
                {!k.revokedAt ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Revoke"
                    onClick={() => onRevoke(k.id)}
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
