"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AdminSidebar, type AdminInfo } from "@/components/admin/app-sidebar";
import { AdminBreadcrumb } from "@/components/admin/breadcrumb";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { adminFetch } from "@/lib/admin-api.client";

export default function AdminDashLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "unauth">("loading");

  useEffect(() => {
    let cancelled = false;
    adminFetch<{ data: AdminInfo }>("auth/admin/me")
      .then((r) => {
        if (cancelled) return;
        setAdmin(r.data);
        setState("ok");
      })
      .catch(() => {
        if (cancelled) return;
        setState("unauth");
        router.replace("/admin/login");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state !== "ok" || !admin) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        {state === "unauth" ? "Redirecting…" : "Loading…"}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar admin={admin} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <AdminBreadcrumb />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
