"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { signOutAction } from "@/app/actions/auth";
import { Bell, Settings, Search, ChevronDown } from "lucide-react";
import type { Profile } from "@/lib/auth";

interface TopbarProps {
  profile: Profile;
}

export function Topbar({ profile }: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-topbar items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Search */}
      <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 transition-colors hover:border-slate-300 sm:flex sm:w-72 lg:w-96">
        <Search className="h-4 w-4 shrink-0" />
        <span>Search employees, documents...</span>
      </div>
      <div className="sm:hidden" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-white" />
        </button>

        {/* Settings */}
        <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <Settings className="h-5 w-5" />
        </button>

        {/* Separator */}
        <div className="mx-1 h-6 w-px bg-slate-200" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
          >
            <Avatar
              name={profile.full_name}
              src={profile.avatar_url}
              size="sm"
              status="present"
            />
            <div className="hidden text-left md:block">
              <div className="text-sm font-medium leading-tight text-slate-800">
                {profile.full_name}
              </div>
              <div className="text-[11px] capitalize leading-tight text-slate-400">
                {profile.role}
              </div>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg animate-scale-in">
                <a
                  href="/dashboard"
                  className="block px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                >
                  My Profile
                </a>
                <a
                  href="/dashboard/attendance"
                  className="block px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                >
                  My Attendance
                </a>
                <div className="my-1 border-t border-slate-100" />
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                    )}
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
