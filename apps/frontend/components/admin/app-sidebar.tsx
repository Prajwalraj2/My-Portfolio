"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  Layers,
  Newspaper,
  BookOpen,
  Inbox,
  Star,
  UserCircle,
  Wrench,
  Briefcase,
  FileText,
  Users,
  CalendarDays,
  LogOut,
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

export interface AdminInfo {
  id: string;
  email: string;
  role: string;
}

const GROUPS: { label: string; items: { href: string; label: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FolderGit2 },
      { href: "/admin/categories", label: "Categories", icon: Layers },
      { href: "/admin/blogs", label: "Blogs", icon: Newspaper },
      { href: "/admin/guides", label: "Guides", icon: BookOpen },
    ],
  },
  {
    label: "Inbox",
    items: [
      { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
      { href: "/admin/testimonials", label: "Testimonials", icon: Star },
    ],
  },
  {
    label: "Config",
    items: [
      { href: "/admin/profile", label: "Profile", icon: UserCircle },
      { href: "/admin/skills", label: "Skills", icon: Wrench },
      { href: "/admin/experience", label: "Experience", icon: Briefcase },
      { href: "/admin/resume", label: "Resume", icon: FileText },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/meetings", label: "Meetings", icon: CalendarDays },
    ],
  },
];

export function AdminSidebar({ admin }: { admin: AdminInfo }) {
  const pathname = usePathname();
  const router = useRouter();

  async function onLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/admin"
          className="flex items-center gap-2 px-2 py-1 font-heading text-sm font-semibold tracking-tight"
        >
          <span className="group-data-[collapsible=icon]:hidden">Admin · Prajwal Raj</span>
          <span className="hidden group-data-[collapsible=icon]:inline">A</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname === item.href || pathname.startsWith(`${item.href}/`)
                    }
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-md p-1">
          <Avatar size="sm">
            <AvatarFallback>{admin.email.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium">Administrator</p>
            <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
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
