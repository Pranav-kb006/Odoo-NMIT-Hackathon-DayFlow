"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";
import { signOutAction } from "@/app/actions/auth";
import type { Profile } from "@/lib/auth";

interface SidebarProps {
  role: Role;
  profile?: Profile;
}

export function Sidebar({ role, profile }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const baseNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    ...(profile?.id
      ? [{ href: `/dashboard/employees/${profile.id}`, label: "My Profile", icon: "person" }]
      : []),
    { href: "/dashboard/employees", label: "Directory", icon: "contacts", adminOnly: true },
    { href: "/dashboard/attendance", label: "Attendance", icon: "calendar_today" },
    { href: "/dashboard/leave", label: "Time Off", icon: "event_busy" },
    { href: "/dashboard/approvals", label: "Approvals", icon: "assignment_turned_in", adminOnly: true },
  ];

  const filteredNav = baseNavItems.filter(
    (item) => !("adminOnly" in item && item.adminOnly) || role === "admin"
  );

  const navContent = (
    <>
      <div className="px-lg mb-xl">
        <h1 className="font-display text-display text-on-primary font-bold">Dayflow</h1>
        <p className="text-on-primary/60 font-body-md text-body-md mt-xs">HR Management</p>
      </div>

      <nav className="flex-1 flex flex-col gap-xs px-sm">
        {filteredNav.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-md px-md py-sm rounded-lg font-body-md text-body-md transition-colors duration-200 ease-in-out",
                isActive
                  ? "text-white bg-secondary-container/10 border-r-4 border-surface-container-highest"
                  : "text-secondary-fixed-dim hover:text-white hover:bg-secondary-container/5"
              )}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-sm pt-md border-t border-white/10 mt-auto">
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex items-center gap-md w-full px-md py-sm rounded-lg text-secondary-fixed-dim hover:text-white hover:bg-secondary-container/5 transition-colors duration-200 font-body-md text-body-md"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[260px] bg-primary text-on-primary font-body-md text-body-md hidden md:flex flex-col py-lg z-20">
        {navContent}
      </aside>

      {/* Mobile Hamburger Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary shadow-md md:hidden"
        aria-label="Open menu"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Mobile Overlay Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-primary/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-[260px] flex-col bg-primary py-lg text-on-primary shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 text-secondary-fixed-dim hover:text-white p-1"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
