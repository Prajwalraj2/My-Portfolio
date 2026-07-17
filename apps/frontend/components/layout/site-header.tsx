import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCategoryList } from "@/lib/fetchers";
import { getSession } from "@/lib/auth.server";
import type { CategoryListItem } from "@/types/api";
import { Container } from "./container";
import { ThemeToggle } from "./theme-toggle";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { LogoutButton } from "@/components/auth/logout-button";

export async function SiteHeader() {
  const [categories, user] = await Promise.all([
    getCategoryList().catch(() => [] as CategoryListItem[]),
    getSession(),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <Container className="relative flex h-16 items-center justify-between gap-4">
        {/* Wordmark */}
        <Link href="/" className="font-heading text-sm font-semibold tracking-tight">
          Prajwal Raj
        </Link>

        {/* Center nav (desktop) — absolutely centered so it never shifts the actions */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 md:block">
          <MainNav categories={categories} />
        </div>

        {/* Actions (always pinned right) */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden items-center gap-2 sm:flex">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  {user.name?.split(" ")[0] ?? "Dashboard"}
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Login
                </Link>
                <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
                  Sign up
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden">
            <MobileNav categories={categories} />
          </div>
        </div>
      </Container>
    </header>
  );
}
