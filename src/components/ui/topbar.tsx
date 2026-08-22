"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { signOutAction } from "@/app/actions/auth";
import type { Profile } from "@/lib/auth";

interface TopbarProps {
  profile: Profile;
}

export function Topbar({ profile }: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="md:ml-[260px] flex justify-between items-center h-16 px-gutter bg-surface-container-lowest text-primary font-body-md text-body-md border-b border-outline-variant fixed top-0 right-0 left-0 z-10">
      <div className="flex items-center gap-lg pl-12 md:pl-0">
        <h2 className="font-headline-md text-headline-md text-primary">Dayflow</h2>
      </div>

      <div className="flex items-center gap-md">
        {/* User profile avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-sm p-1.5 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
            aria-label="User menu"
          >
            <Avatar
              name={profile.full_name}
              src={profile.avatar_url}
              size="sm"
              status="present"
            />
            <span className="hidden sm:inline-block font-label-md text-xs font-semibold text-on-surface">
              {profile.full_name.split(" ")[0]}
            </span>
            <span className="material-symbols-outlined text-secondary text-[18px]">
              expand_more
            </span>
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-outline-variant bg-surface-container-lowest py-2 shadow-xl animate-in fade-in-50 zoom-in-95">
                <div className="px-4 py-3 border-b border-outline-variant/30">
                  <p className="font-label-md text-sm font-bold text-on-surface">
                    {profile.full_name}
                  </p>
                  <p className="font-mono-sm text-xs text-secondary capitalize mt-0.5">
                    {profile.department ?? "General"} · {profile.role}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    href={`/dashboard/employees/${profile.id}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px] text-secondary">
                      person
                    </span>
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/dashboard/attendance"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px] text-secondary">
                      calendar_today
                    </span>
                    <span>My Attendance</span>
                  </Link>

                  <Link
                    href="/dashboard/leave"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px] text-secondary">
                      event_busy
                    </span>
                    <span>Time Off</span>
                  </Link>
                </div>

                <div className="border-t border-outline-variant/30 pt-1 mt-1">
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px] text-red-500">
                        logout
                      </span>
                      <span>Sign out</span>
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
