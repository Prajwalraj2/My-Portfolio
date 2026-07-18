import type { Metadata } from "next";
import { getSession } from "@/lib/auth.server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" };

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default async function SettingsPage() {
  const user = await getSession();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-muted-foreground">Your account details.</p>

      <div className="mt-8 divide-y rounded-xl border px-5">
        <Row label="Name" value={user.name ?? "—"} />
        <Row label="Email" value={user.email} />
        <Row label="Email verified" value={user.emailVerified ? "Yes" : "No"} />
        <Row label="Role" value={user.role} />
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Profile editing is coming soon.
      </p>
    </div>
  );
}
