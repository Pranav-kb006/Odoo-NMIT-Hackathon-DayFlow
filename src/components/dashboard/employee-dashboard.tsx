import type { Profile } from "@/lib/auth";
import { EmployeePayslips } from "@/components/dashboard/employee-payslips";

interface EmployeeDashboardProps {
  profile: Profile;
}

/**
 * Employee home. No fake state here — check-in/out is a real action on
 * /dashboard/attendance, so this card reflects today's status via a link and
 * the balances card defers to the real leave page.
 */
export function EmployeeDashboard({ profile }: EmployeeDashboardProps) {
  const firstName = profile.full_name.split(" ")[0];

  return (
    <div className="space-y-xl">
      {/* Welcome */}
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">
          Welcome back, {firstName}
        </h2>
        <p className="text-secondary font-body-lg text-body-lg mt-xs">
          {profile.department ?? "Team"} · {profile.designation ?? "Employee"}
        </p>
      </div>

      {/* Today status — real state lives in /attendance; deep-link there */}
      <a
        href="/dashboard/attendance"
        className="block bg-surface-container-lowest border border-outline-variant rounded-lg p-lg flex flex-wrap items-center justify-between gap-md hover:border-primary transition-colors"
      >
        <div className="flex items-center gap-md">
          <span className="material-symbols-outlined text-primary text-[28px]">today</span>
          <div>
            <p className="font-body-md text-body-md font-bold text-on-surface">
              Today&apos;s attendance
            </p>
            <p className="font-mono-sm text-mono-sm text-secondary">
              Check in / check out and see your status —{" "}
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
        <span className="px-md py-xs rounded-full bg-surface-container-high text-primary font-label-md text-label-md">
          Open attendance →
        </span>
      </a>

      {/* Quick Navigation Cards */}
      <div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Quick Access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
          <a
            href="/dashboard/attendance"
            className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg flex items-center justify-between hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-primary text-[28px]">calendar_today</span>
              <div>
                <p className="font-body-md text-body-md font-bold text-on-surface">Attendance Log</p>
                <p className="font-mono-sm text-mono-sm text-secondary">Monthly check-in history</p>
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
                <p className="font-body-md text-body-md font-bold text-on-surface">Time Off</p>
                <p className="font-mono-sm text-mono-sm text-secondary">Apply for leave, track requests</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary">arrow_forward</span>
          </a>

          <a
            href="/dashboard/employees"
            className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg flex items-center justify-between hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-primary text-[28px]">badge</span>
              <div>
                <p className="font-body-md text-body-md font-bold text-on-surface">Directory</p>
                <p className="font-mono-sm text-mono-sm text-secondary">Find teammates & contact info</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary">arrow_forward</span>
          </a>
        </div>
      </div>

      {/* Payslips — last 12 months, read from the payslips table (RLS scopes to own rows) */}
      <EmployeePayslips profileId={profile.id} />
    </div>
  );
}