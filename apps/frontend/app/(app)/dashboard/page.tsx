import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, KeyRound, Briefcase, Settings } from "lucide-react";
import { getSession } from "@/lib/auth.server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

const CARDS = [
  { href: "/connect", label: "Meetings", body: "See your booked calls with Prajwal.", icon: CalendarDays },
  { href: "/mcp", label: "API Keys", body: "Create keys for the local MCP server.", icon: KeyRound },
  { href: "/services", label: "Services", body: "Send a project or freelance inquiry.", icon: Briefcase },
  { href: "/settings", label: "Settings", body: "Your account details.", icon: Settings },
];

export default async function DashboardPage() {
  const user = await getSession();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
      </h1>
      <p className="mt-1 text-muted-foreground">{user?.email}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-xl border p-5 transition-colors hover:bg-muted/40"
          >
            <c.icon className="size-5 text-muted-foreground" />
            <h2 className="mt-3 font-heading font-medium">{c.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
