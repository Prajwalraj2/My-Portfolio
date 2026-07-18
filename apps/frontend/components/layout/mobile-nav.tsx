"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CategoryListItem } from "@/types/api";

const TOP_LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "All projects" },
  { href: "/guides", label: "Guides" },
  { href: "/blogs", label: "Blogs" },
  { href: "/chatfeatures", label: "Chat Features" },
  { href: "/contact", label: "Contact" },
];

const linkClass =
  "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

export function MobileNav({ categories }: { categories: CategoryListItem[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
        <Menu />
      </SheetTrigger>
      <SheetContent side="right" className="w-72 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-4 pb-8">
          {TOP_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={close} className={linkClass}>
              {l.label}
            </Link>
          ))}

          {categories.length > 0 ? (
            <>
              <p className="mt-4 px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Categories
              </p>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/projects/${c.slug}`}
                  onClick={close}
                  className={linkClass}
                >
                  {c.name}
                </Link>
              ))}
            </>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 px-3">
            <Link
              href="/login"
              onClick={close}
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={close}
              className={cn(buttonVariants(), "w-full")}
            >
              Sign up
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
