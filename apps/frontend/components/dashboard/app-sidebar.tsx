"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  KeyRound,
  Briefcase,
  Settings,
  LogOut,
  MessageCircle,
  BookOpen,
  FolderGit2,
  Newspaper,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/icons";
import { logout } from "@/lib/auth-actions";
import type { SessionUser } from "@/lib/auth.server";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat with Lisa", icon: MessageCircle },
  { href: "/connect", label: "Meetings", icon: CalendarDays },
  { href: "/mcp", label: "API Keys", icon: KeyRound },
  { href: "/services", label: "Services", icon: Briefcase },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Public site pages — open in a new tab so the dashboard stays put.
const EXPLORE = [
  { href: "/projects", label: "Projects", icon: FolderGit2 },
  { href: "/guides", label: "Guides", icon: BookOpen },
  { href: "/blogs", label: "Blogs", icon: Newspaper },
  { href: "/chatfeatures", label: "Chat Features", icon: Sparkles },
];

const SOCIALS = [
  { href: "https://github.com/Prajwalraj2", label: "GitHub", icon: GithubIcon },
  { href: "https://www.linkedin.com/in/prajwalraj1", label: "LinkedIn", icon: LinkedinIcon },
  { href: "https://x.com/prajwalraj23", label: "Twitter", icon: XIcon },
];

function initials(user: SessionUser) {
  const src = user.name || user.email;
  return src.slice(0, 2).toUpperCase();
}

export function AppSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function onLogout() {
    try {
      await logout();
    } catch {
      /* ignore */
    }
    router.push("/");
    router.refresh();
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/"
          className="flex items-center gap-2 px-2 py-1 font-heading text-sm font-semibold tracking-tight"
        >
          <span className="group-data-[collapsible=icon]:hidden">Prajwal Raj</span>
          <span className="hidden group-data-[collapsible=icon]:inline">PR</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {NAV.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Explore</SidebarGroupLabel>
          <SidebarMenu>
            {EXPLORE.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<a href={item.href} target="_blank" rel="noreferrer" />}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                  <ExternalLink className="ml-auto size-3.5 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Connect</SidebarGroupLabel>
          <SidebarMenu>
            {SOCIALS.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<a href={item.href} target="_blank" rel="noreferrer" />}
                  tooltip={item.label}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                  <ExternalLink className="ml-auto size-3.5 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-md p-1">
          <Avatar size="sm">
            <AvatarFallback>{initials(user)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium">{user.name ?? "Account"}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={onLogout}
            aria-label="Log out"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
