"use client";

import { useState } from "react";
import {
  User,
  CalendarDays,
  Clock,
  LogOut,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import type { Profile } from "@/lib/auth";

interface EmployeeDashboardProps {
  profile: Profile;
}

/* ─── Quick Access Card ─── */
function QuickCard({
  icon: Icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  return (
    <a
      href={href}
      className="group block rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100"
    >
      <div
        className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        Open <ArrowRight className="h-3 w-3" />
      </div>
    </a>
  );
}

export function EmployeeDashboard({ profile }: EmployeeDashboardProps) {
  const [checkedIn, setCheckedIn] = useState(false);

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 17
      ? "Good afternoon"
      : "Good evening";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting + Check-in */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            name={profile.full_name}
            src={profile.avatar_url}
            size="xl"
            status={checkedIn ? "present" : "absent"}
          />
          <div>
            <h1 className="text-display text-slate-900">
              {greeting}, {profile.full_name.split(" ")[0]}
            </h1>
            <p className="mt-1 text-secondary">
              {profile.department ?? "No department"} ·{" "}
              {profile.designation ?? "Employee"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCheckedIn(!checkedIn)}
          className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition-all duration-200 ${
            checkedIn
              ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
              : "bg-green-600 text-white hover:bg-green-700 shadow-green-600/25"
          }`}
        >
          {checkedIn ? (
            <>
              <XCircle className="h-4 w-4" />
              Check Out
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Check In
            </>
          )}
        </button>
      </div>

      {/* Status card */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-full ${
                checkedIn ? "bg-green-500" : "bg-slate-300"
              }`}
            />
            <span className="text-sm font-medium text-slate-700">
              {checkedIn ? "Currently checked in" : "Not checked in"}
            </span>
          </div>
          <div className="text-sm text-slate-500">
            Today:{" "}
            {now.toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <Badge variant={checkedIn ? "success" : "neutral"}>
            {checkedIn ? "Present" : "Awaiting check-in"}
          </Badge>
        </div>
      </Card>

      {/* Quick Access */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickCard
            icon={User}
            title="My Profile"
            description="View and update your personal information"
            href="/dashboard"
            color="bg-blue-50 text-blue-600"
          />
          <QuickCard
            icon={CalendarDays}
            title="Attendance"
            description="View your monthly attendance log"
            href="/dashboard/attendance"
            color="bg-green-50 text-green-600"
          />
          <QuickCard
            icon={Clock}
            title="Leave Requests"
            description="Apply for time off or check balances"
            href="/dashboard/leave"
            color="bg-amber-50 text-amber-600"
          />
          <QuickCard
            icon={LogOut}
            title="Sign Out"
            description="End your current session"
            href="/login"
            color="bg-slate-100 text-slate-600"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Recent Activity
          </h2>
        </div>
        <div className="divide-y divide-slate-50 px-5">
          {[
            {
              text: "You checked in at 9:05 AM",
              time: "Today",
              icon: CheckCircle2,
              color: "bg-green-50 text-green-600",
            },
            {
              text: "Leave request approved — Oct 15-16",
              time: "Yesterday",
              icon: CalendarDays,
              color: "bg-blue-50 text-blue-600",
            },
            {
              text: "Profile updated — phone number changed",
              time: "3 days ago",
              icon: User,
              color: "bg-slate-100 text-slate-600",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 py-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.color}`}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">{item.text}</p>
                <p className="mt-0.5 text-xs text-slate-400">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Leave Balance Summary */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Leave Balance
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              type: "Paid Time Off",
              available: 18,
              total: 24,
              color: "text-blue-600",
              bg: "bg-blue-600",
            },
            {
              type: "Sick Leave",
              available: 7,
              total: 10,
              color: "text-amber-600",
              bg: "bg-amber-600",
            },
            {
              type: "Unpaid Leave",
              available: 5,
              total: 5,
              color: "text-slate-600",
              bg: "bg-slate-600",
            },
          ].map((leave) => (
            <Card key={leave.type} className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {leave.type}
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={`text-stat ${leave.color}`}>
                  {leave.available}
                </span>
                <span className="text-sm text-slate-400">
                  / {leave.total} days
                </span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-slate-100">
                <div
                  className={`h-1.5 rounded-full ${leave.bg} transition-all duration-500`}
                  style={{
                    width: `${(leave.available / leave.total) * 100}%`,
                  }}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
