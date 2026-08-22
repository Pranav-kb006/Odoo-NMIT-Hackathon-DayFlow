import {
  Users,
  UserCheck,
  FileText,
  CalendarDays,
  UserPlus,
  ClipboardCheck,
  Settings,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import type { Profile } from "@/lib/auth";

interface AdminDashboardProps {
  profile: Profile;
}

/* ─── Stat Card ─── */
function StatCard({
  label,
  value,
  subtitle,
  subtitleColor,
  icon: Icon,
}: {
  label: string;
  value: string;
  subtitle: string;
  subtitleColor?: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="p-5 transition-all duration-200 hover:shadow-md hover:shadow-slate-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-stat text-slate-900">{value}</p>
          <p
            className={`mt-1 text-xs font-medium ${
              subtitleColor ?? "text-slate-500"
            }`}
          >
            {subtitle}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

/* ─── Activity Item ─── */
function ActivityItem({
  icon: Icon,
  iconBg,
  children,
  time,
}: {
  icon: React.ElementType;
  iconBg: string;
  children: React.ReactNode;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700">{children}</p>
        <p className="mt-0.5 text-xs text-slate-400">{time}</p>
      </div>
    </div>
  );
}

/* ─── Schedule Item ─── */
function ScheduleItem({
  month,
  day,
  title,
  time,
}: {
  month: string;
  day: string;
  title: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-accent-50 text-accent-700">
        <span className="text-[10px] font-bold uppercase leading-none">
          {month}
        </span>
        <span className="text-lg font-bold leading-tight">{day}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="text-xs text-slate-400">{time}</p>
      </div>
    </div>
  );
}

export function AdminDashboard({ profile }: AdminDashboardProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-display text-slate-900">
          Welcome back, {profile.full_name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-secondary">
          Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Employees"
          value="142"
          subtitle="+3 this month"
          icon={Users}
        />
        <StatCard
          label="Attendance Rate"
          value="94%"
          subtitle="On track"
          subtitleColor="text-green-600"
          icon={UserCheck}
        />
        <StatCard
          label="Pending Requests"
          value="5"
          subtitle="Requires attention"
          subtitleColor="text-red-600"
          icon={FileText}
        />
        <StatCard
          label="Upcoming Holidays"
          value="2"
          subtitle="In the next 30 days"
          icon={CalendarDays}
        />
      </div>

      {/* Bottom grid: Activity + Schedule */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-slate-50 px-5">
            <ActivityItem
              icon={UserPlus}
              iconBg="bg-blue-50 text-blue-600"
              time="2 hours ago"
            >
              <strong className="font-semibold text-slate-900">
                Alex Chen
              </strong>{" "}
              joined the Engineering team.
            </ActivityItem>
            <ActivityItem
              icon={FileText}
              iconBg="bg-amber-50 text-amber-600"
              time="4 hours ago"
            >
              <strong className="font-semibold text-slate-900">
                Maria Garcia
              </strong>{" "}
              requested PTO for Oct 12-14.
            </ActivityItem>
            <ActivityItem
              icon={ClipboardCheck}
              iconBg="bg-green-50 text-green-600"
              time="Yesterday"
            >
              Q3 Performance Reviews completed by{" "}
              <strong className="font-semibold text-slate-900">
                Design Team
              </strong>
              .
            </ActivityItem>
            <ActivityItem
              icon={Settings}
              iconBg="bg-slate-100 text-slate-600"
              time="2 days ago"
            >
              Company working days updated to{" "}
              <strong className="font-semibold text-slate-900">
                5 days/week
              </strong>
              .
            </ActivityItem>
          </div>
        </Card>

        {/* Schedule */}
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Schedule
            </h2>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              This Week
            </span>
          </div>
          <div className="divide-y divide-slate-50 px-5 py-1">
            <ScheduleItem
              month="OCT"
              day="10"
              title="All-Hands Meeting"
              time="10:00 AM - 11:30 AM"
            />
            <ScheduleItem
              month="OCT"
              day="12"
              title="Candidate Interviews"
              time="1:00 PM - 4:00 PM"
            />
            <ScheduleItem
              month="OCT"
              day="14"
              title="Team Lunch"
              time="12:30 PM"
            />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-5">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Add Employee",
              icon: UserPlus,
              href: "/dashboard/employees",
              color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
            },
            {
              label: "View Attendance",
              icon: CalendarDays,
              href: "/dashboard/attendance",
              color: "bg-green-50 text-green-600 hover:bg-green-100",
            },
            {
              label: "Pending Approvals",
              icon: ClipboardCheck,
              href: "/dashboard/approvals",
              color: "bg-amber-50 text-amber-600 hover:bg-amber-100",
            },
            {
              label: "Analytics",
              icon: TrendingUp,
              href: "/dashboard",
              color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
            },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className={`flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all duration-150 ${action.color}`}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-xs font-semibold">{action.label}</span>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
