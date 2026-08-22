import type { Profile } from "@/lib/auth";

export interface AdminStats {
  headcount: number;
  presentToday: number;
  pendingLeaves: number;
}

interface AdminDashboardProps {
  profile: Profile;
  stats: AdminStats;
}

/** Admin home — all numbers are real, queried server-side in page.tsx. */
export function AdminDashboard({ profile, stats }: AdminDashboardProps) {
  const firstName = profile.full_name.split(" ")[0];
  const attendanceRate = stats.headcount > 0
    ? Math.round((stats.presentToday / stats.headcount) * 100)
    : 0;

  return (
    <div className="space-y-xl">
      {/* Welcome Header */}
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">
          Welcome back, {firstName}
        </h2>
        <p className="text-secondary font-body-lg text-body-lg mt-xs">
          Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Metric Cards Grid — live data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">
              Total Employees
            </span>
            <span className="material-symbols-outlined text-primary">group</span>
          </div>
          <div className="font-display text-display text-on-surface">{stats.headcount}</div>
          <div className="text-secondary font-body-md text-body-md mt-xs flex items-center gap-xs">
            <a href="/dashboard/employees" className="text-primary font-label-md hover:underline">View directory</a>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">
              Present Today
            </span>
            <span className="material-symbols-outlined text-primary">how_to_reg</span>
          </div>
          <div className="font-display text-display text-on-surface">{stats.presentToday}</div>
          <div className="text-secondary font-body-md text-body-md mt-xs flex items-center gap-xs">
            <span className="text-primary font-label-md">{attendanceRate}% of team</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">
              Pending Requests
            </span>
            <span className="material-symbols-outlined text-primary">assignment_late</span>
          </div>
          <div className="font-display text-display text-on-surface">{stats.pendingLeaves}</div>
          <div className="text-secondary font-body-md text-body-md mt-xs flex items-center gap-xs">
            {stats.pendingLeaves > 0 ? (
              <a href="/dashboard/approvals" className="text-error font-label-md hover:underline">Requires attention</a>
            ) : (
              <span className="text-primary font-label-md">All caught up</span>
            )}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">
              Quick Actions
            </span>
            <span className="material-symbols-outlined text-primary">bolt</span>
          </div>
          <div className="flex flex-col gap-xs mt-sm">
            <a href="/dashboard/attendance" className="font-label-md text-primary hover:underline">Attendance overview</a>
            <a href="/dashboard/leave" className="font-label-md text-primary hover:underline">Leave management</a>
          </div>
        </div>
      </div>

      {/* Empty-state hint when the company is brand new */}
      {stats.headcount <= 1 && (
        <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-lg text-center">
          <p className="font-body-md text-body-md text-on-surface">Just you so far.</p>
          <p className="text-secondary font-body-md text-body-md mt-xs">
            Add your team from the <a href="/dashboard/employees" className="text-primary hover:underline">Employees</a> page.
          </p>
        </div>
      )}
    </div>
  );
}