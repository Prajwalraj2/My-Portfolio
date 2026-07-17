"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Inbox, Star, FolderGit2, Newspaper, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/admin-api.client";

interface Counts {
  inquiriesTotal: number;
  inquiriesNew: number;
  testimonialsPending: number;
  projects: number;
  blogs: number;
  guides: number;
}

// Count helper: prefer a server-provided total, else fall back to array length.
function countOf(res: { data?: unknown; pagination?: { total?: number } }): number {
  if (typeof res?.pagination?.total === "number") return res.pagination.total;
  return Array.isArray(res?.data) ? res.data.length : 0;
}

export default function AdminOverviewPage() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [stats, pending, projects, blogs, guides] = await Promise.allSettled([
        adminFetch<{ data: { total: number; new: number } }>("inquiries/stats"),
        adminFetch<{ data: unknown[] }>("testimonials/pending"),
        adminFetch<{ data: unknown[]; pagination?: { total?: number } }>("projects/all"),
        adminFetch<{ data: unknown[]; pagination?: { total?: number } }>("blogs/all?limit=1"),
        adminFetch<{ data: unknown[] }>("guides/all"),
      ]);
      setCounts({
        inquiriesTotal: stats.status === "fulfilled" ? stats.value.data.total : 0,
        inquiriesNew: stats.status === "fulfilled" ? stats.value.data.new : 0,
        testimonialsPending: pending.status === "fulfilled" ? countOf(pending.value) : 0,
        projects: projects.status === "fulfilled" ? countOf(projects.value) : 0,
        blogs: blogs.status === "fulfilled" ? countOf(blogs.value) : 0,
        guides: guides.status === "fulfilled" ? countOf(guides.value) : 0,
      });
    })();
  }, []);

  async function refreshGithub() {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      await adminFetch("github/refresh", { method: "POST" });
      setRefreshMsg("GitHub cache refreshed.");
    } catch {
      setRefreshMsg("Failed to refresh GitHub cache.");
    } finally {
      setRefreshing(false);
    }
  }

  const cards = [
    { label: "Inquiries", value: counts?.inquiriesTotal, sub: counts ? `${counts.inquiriesNew} new` : "", href: "/admin/inquiries", icon: Inbox },
    { label: "Pending testimonials", value: counts?.testimonialsPending, sub: "awaiting review", href: "/admin/testimonials", icon: Star },
    { label: "Projects", value: counts?.projects, sub: "total", href: "/admin/projects", icon: FolderGit2 },
    { label: "Blogs", value: counts?.blogs, sub: "total", href: "/admin/blogs", icon: Newspaper },
    { label: "Guides", value: counts?.guides, sub: "total", href: "/admin/guides", icon: BookOpen },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-muted-foreground">Manage the site content, inbox, and configuration.</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button variant="outline" size="sm" onClick={refreshGithub} disabled={refreshing} className="gap-2">
            <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} />
            Refresh GitHub
          </Button>
          {refreshMsg ? <span className="text-xs text-muted-foreground">{refreshMsg}</span> : null}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border p-5 transition-colors hover:border-foreground/30 hover:bg-muted/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-3 font-heading text-3xl font-semibold tabular-nums">
              {c.value ?? "—"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{c.sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
