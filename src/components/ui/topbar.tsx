"use client";

import { useState } from "react";
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
        <h2 className="font-headline-md text-headline-md text-primary">Dashboard</h2>
      </div>

      <div className="flex items-center gap-md">
        <div className="flex items-center gap-sm">
          <button
            className="p-xs text-secondary hover:text-primary hover:bg-surface-container-low transition-colors rounded-full"
            title="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            className="p-xs text-secondary hover:text-primary hover:bg-surface-container-low transition-colors rounded-full"
            title="Settings"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        {/* User profile avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-sm p-xs rounded-full hover:bg-surface-container-low transition-colors"
          >
            <Avatar
              name={profile.full_name}
              src={profile.avatar_url}
              size="sm"
              status="present"
            />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-outline-variant bg-surface-container-lowest py-2 shadow-lg">
                <div className="px-4 py-2 border-b border-outline-variant/30">
                  <p className="font-label-md text-label-md font-bold text-on-surface">
                    {profile.full_name}
                  </p>
                  <p className="font-mono-sm text-mono-sm text-secondary capitalize">
                    {profile.role}
                  </p>
                </div>
                <form action={signOutAction} className="mt-1">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 text-left font-body-md text-body-md text-error hover:bg-error-container/30 transition-colors"
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
