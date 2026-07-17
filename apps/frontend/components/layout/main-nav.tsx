"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import type { CategoryListItem } from "@/types/api";

const RESOURCES = [
  { href: "/blogs", label: "Blogs" },
  { href: "/guides", label: "Guides" },
  { href: "/connect", label: "Book a Call" },
  { href: "/chatfeatures", label: "Chat Features" },
];

export function MainNav({ categories }: { categories: CategoryListItem[] }) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle()}
            render={<Link href="/" />}
          >
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Projects</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-60 gap-1">
              <li>
                <NavigationMenuLink render={<Link href="/projects" />}>
                  All projects
                </NavigationMenuLink>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <NavigationMenuLink render={<Link href={`/projects/${c.slug}`} />}>
                    {c.name}
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle()}
            render={<Link href="/guides" />}
          >
            Guides
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-48 gap-1">
              {RESOURCES.map((r) => (
                <li key={r.label}>
                  <NavigationMenuLink render={<Link href={r.href} />}>
                    {r.label}
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle()}
            render={<Link href="/chatfeatures" />}
          >
            Chat Features
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
