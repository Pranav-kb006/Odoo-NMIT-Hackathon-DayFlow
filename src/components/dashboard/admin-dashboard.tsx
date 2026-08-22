import type { Profile } from "@/lib/auth";

interface AdminDashboardProps {
  profile: Profile;
}

export function AdminDashboard({ profile }: AdminDashboardProps) {
  const firstName = profile.full_name.split(" ")[0];

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

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">
              Total Employees
            </span>
            <span className="material-symbols-outlined text-primary">group</span>
          </div>
          <div className="font-display text-display text-on-surface">142</div>
          <div className="text-secondary font-body-md text-body-md mt-xs flex items-center gap-xs">
            <span className="text-primary font-label-md">+3 this month</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">
              Attendance Rate
            </span>
            <span className="material-symbols-outlined text-primary">how_to_reg</span>
          </div>
          <div className="font-display text-display text-on-surface">94%</div>
          <div className="text-secondary font-body-md text-body-md mt-xs flex items-center gap-xs">
            <span className="text-primary font-label-md">On track</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">
              Pending Requests
            </span>
            <span className="material-symbols-outlined text-primary">assignment_late</span>
          </div>
          <div className="font-display text-display text-on-surface">5</div>
          <div className="text-secondary font-body-md text-body-md mt-xs flex items-center gap-xs">
            <span className="text-error font-label-md">Requires attention</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">
              Upcoming Holidays
            </span>
            <span className="material-symbols-outlined text-primary">celebration</span>
          </div>
          <div className="font-display text-display text-on-surface">2</div>
          <div className="text-secondary font-body-md text-body-md mt-xs flex items-center gap-xs">
            <span className="text-primary font-label-md">In the next 30 days</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Activity + Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Recent Activity Card */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-lg p-lg">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-lg">
            Recent Activity
          </h3>
          <div className="flex flex-col gap-md">
            <div className="flex items-start gap-md pb-md border-b border-outline-variant/30">
              <div className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">person_add</span>
              </div>
              <div className="flex-1">
                <p className="font-body-md text-body-md text-on-surface">
                  <span className="font-bold">Alex Chen</span> joined the Engineering team.
                </p>
                <p className="font-mono-sm text-mono-sm text-secondary mt-xs">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-md pb-md border-b border-outline-variant/30">
              <div className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">event_busy</span>
              </div>
              <div className="flex-1">
                <p className="font-body-md text-body-md text-on-surface">
                  <span className="font-bold">Maria Garcia</span> requested PTO for Oct 12-14.
                </p>
                <p className="font-mono-sm text-mono-sm text-secondary mt-xs">4 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-md">
              <div className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
              <div className="flex-1">
                <p className="font-body-md text-body-md text-on-surface">
                  Q3 Performance Reviews completed by <span className="font-bold">Design Team</span>.
                </p>
                <p className="font-mono-sm text-mono-sm text-secondary mt-xs">Yesterday</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="font-headline-md text-headline-md text-on-surface">Schedule</h3>
            <span className="font-label-md text-label-md text-secondary uppercase tracking-wider">
              This Week
            </span>
          </div>
          <div className="flex flex-col gap-md">
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 rounded-lg bg-primary text-on-primary flex flex-col items-center justify-center">
                <span className="font-mono-sm text-[10px] uppercase font-bold leading-none">OCT</span>
                <span className="font-headline-md text-[16px] font-bold leading-tight">10</span>
              </div>
              <div>
                <p className="font-body-md text-body-md font-bold text-on-surface">All-Hands Meeting</p>
                <p className="font-mono-sm text-mono-sm text-secondary">10:00 AM - 11:30 AM</p>
              </div>
            </div>

            <div className="flex items-center gap-md">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high text-primary flex flex-col items-center justify-center">
                <span className="font-mono-sm text-[10px] uppercase font-bold leading-none">OCT</span>
                <span className="font-headline-md text-[16px] font-bold leading-tight">12</span>
              </div>
              <div>
                <p className="font-body-md text-body-md font-bold text-on-surface">Candidate Interviews</p>
                <p className="font-mono-sm text-mono-sm text-secondary">1:00 PM - 4:00 PM</p>
              </div>
            </div>

            <div className="flex items-center gap-md">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high text-primary flex flex-col items-center justify-center">
                <span className="font-mono-sm text-[10px] uppercase font-bold leading-none">OCT</span>
                <span className="font-headline-md text-[16px] font-bold leading-tight">14</span>
              </div>
              <div>
                <p className="font-body-md text-body-md font-bold text-on-surface">Team Lunch</p>
                <p className="font-mono-sm text-mono-sm text-secondary">12:30 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
