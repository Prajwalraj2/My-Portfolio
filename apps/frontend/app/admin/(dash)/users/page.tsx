"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminHeader, fieldClass } from "@/components/admin/form";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/lib/admin-api.client";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  oauthAccounts: { provider: string }[];
}

function providerOf(u: AdminUser) {
  if (u.oauthAccounts?.length) return u.oauthAccounts.map((a) => a.provider).join(", ");
  return "password";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load(q = "") {
    setLoading(true);
    try {
      const res = await adminFetch<{ data: { users: AdminUser[] } }>(
        `auth/admin/users${q ? `?search=${encodeURIComponent(q)}` : ""}`
      );
      setUsers(res.data.users);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);

  async function toggleActive(u: AdminUser) {
    setBusyId(u.id);
    try {
      await adminFetch(`auth/admin/users/${u.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !u.isActive }),
      });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, isActive: !x.isActive } : x)));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <AdminHeader title="Users" description="People who have signed up." />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void load(search);
        }}
        className="mt-6 flex gap-2"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className={`${fieldClass} max-w-xs`}
        />
        <Button type="submit" variant="outline">Search</Button>
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">User</th>
              <th className="px-4 py-2.5 font-medium">Sign-in</th>
              <th className="px-4 py-2.5 font-medium">Verified</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No users.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 font-medium">
                      {u.name ?? "—"}
                      {u.role === "admin" ? <span className="rounded bg-muted px-1.5 py-0.5 text-xs">admin</span> : null}
                    </div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-4 py-2.5 capitalize text-muted-foreground">{providerOf(u)}</td>
                  <td className="px-4 py-2.5">{u.emailVerified ? "Yes" : "No"}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn("rounded px-1.5 py-0.5 text-xs", u.isActive ? "bg-muted" : "bg-muted text-muted-foreground")}>
                      {u.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busyId === u.id}
                        onClick={() => toggleActive(u)}
                        className="h-7 text-xs"
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
