"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Clock,
  FileCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth";

interface SidebarProps {
  role: Role;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/employees", label: "Directory", icon: Users, adminOnly: true },
  { href: "/dashboard/attendance", label: "Attendance", icon: CalendarDays },
  { href: "/dashboard/leave", label: "Time Off", icon: Clock },
  { href: "/dashboard/approvals", label: "Approvals", icon: FileCheck, adminOnly: true },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredNav = NAV_ITEMS.filter(
    (item) => !item.adminOnly || role === "admin"
  );

  const navContent = (
    <>
      {/* Logo area */}
      <div className="flex h-topbar items-center gap-3 border-b border-slate-700/50 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
          <LayoutDashboard className="h-4 w-4" />
        </div>
        <div>
          <span className="text-base font-semibold tracking-tight text-white">
            Dayflow
          </span>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            HR Management
          </p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 p-3">
        {filteredNav.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-accent/10 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom sign out */}
      <div className="border-t border-slate-700/50 p-3">
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign Out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-sidebar flex-col bg-slate-900 md:flex">
        {navContent}
      </aside>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-lg md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-overlay-fade"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-sidebar flex-col bg-slate-900 animate-slide-in-left">
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
