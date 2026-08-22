"use client";

import { useState } from "react";
import type { Profile } from "@/lib/auth";

interface EmployeeDashboardProps {
  profile: Profile;
}

export function EmployeeDashboard({ profile }: EmployeeDashboardProps) {
  const [checkedIn, setCheckedIn] = useState(false);
  const firstName = profile.full_name.split(" ")[0];

  return (
    <div className="space-y-xl">
      {/* Welcome & Check In Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Welcome back, {firstName}
          </h2>
          <p className="text-secondary font-body-lg text-body-lg mt-xs">
            {profile.department ?? "Department"} · {profile.designation ?? "Employee"}
          </p>
        </div>

        <button
          onClick={() => setCheckedIn(!checkedIn)}
          className={`h-11 px-6 rounded-lg font-label-md text-label-md flex items-center gap-xs transition-colors ${
            checkedIn
              ? "bg-error text-on-error hover:bg-error/90"
              : "bg-primary text-on-primary hover:bg-primary/90"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {checkedIn ? "logout" : "login"}
          </span>
          <span>{checkedIn ? "Check Out" : "Check In"}</span>
        </button>
      </div>

      {/* Today Status Metric Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg flex flex-wrap items-center justify-between gap-md">
        <div className="flex items-center gap-md">
          <div
            className={`w-3 h-3 rounded-full ${
              checkedIn ? "bg-status-present" : "bg-outline"
            }`}
          />
          <div>
            <p className="font-body-md text-body-md font-bold text-on-surface">
              {checkedIn ? "Checked In Today" : "Not Checked In Yet"}
            </p>
            <p className="font-mono-sm text-mono-sm text-secondary">
              Today: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
        <div className="px-md py-xs rounded-full bg-surface-container-high text-primary font-label-md text-label-md">
          {checkedIn ? "PRESENT" : "AWAITING CHECK-IN"}
        </div>
      </div>

      {/* Leave Balances Grid */}
      <div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-md">
          Time Off Balances
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
            <div className="flex justify-between items-start mb-sm">
              <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                Paid Time Off
              </span>
              <span className="material-symbols-outlined text-primary">event_available</span>
            </div>
            <div className="font-display text-display text-on-surface">18</div>
            <p className="font-mono-sm text-mono-sm text-secondary mt-xs">24 Days Available Pool</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
            <div className="flex justify-between items-start mb-sm">
              <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                Sick Leave
              </span>
              <span className="material-symbols-outlined text-primary">medical_services</span>
            </div>
            <div className="font-display text-display text-on-surface">7</div>
            <p className="font-mono-sm text-mono-sm text-secondary mt-xs">10 Days Available Pool</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
            <div className="flex justify-between items-start mb-sm">
              <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">
                Unpaid Leave
              </span>
              <span className="material-symbols-outlined text-primary">event_busy</span>
            </div>
            <div className="font-display text-display text-on-surface">5</div>
            <p className="font-mono-sm text-mono-sm text-secondary mt-xs">Unlimited</p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-md">
          Quick Access
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
          <a
            href="/dashboard/attendance"
            className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg flex items-center justify-between hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-primary text-[28px]">calendar_today</span>
              <div>
                <p className="font-body-md text-body-md font-bold text-on-surface">Attendance Log</p>
                <p className="font-mono-sm text-mono-sm text-secondary">View monthly check-in history</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary">arrow_forward</span>
          </a>

          <a
            href="/dashboard/leave"
            className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg flex items-center justify-between hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-primary text-[28px]">event_busy</span>
              <div>
                <p className="font-body-md text-body-md font-bold text-on-surface">Apply for Leave</p>
                <p className="font-mono-sm text-mono-sm text-secondary">Submit PTO or Sick request</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary">arrow_forward</span>
          </a>

          <a
            href="/dashboard"
            className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg flex items-center justify-between hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-primary text-[28px]">badge</span>
              <div>
                <p className="font-body-md text-body-md font-bold text-on-surface">My Profile</p>
                <p className="font-mono-sm text-mono-sm text-secondary">View personal & employee info</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary">arrow_forward</span>
          </a>
        </div>
      </div>
    </div>
  );
}
