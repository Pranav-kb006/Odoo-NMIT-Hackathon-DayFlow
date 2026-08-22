import SignupForm from "@/components/auth/signup-form";
import { LayoutDashboard } from "lucide-react";

export const metadata = { title: "Create your company — Dayflow" };

export default function SignupPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-12 text-white">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent shadow-lg shadow-accent/25">
            <LayoutDashboard className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Dayflow</h2>
          <p className="mt-2 text-slate-400">
            Every workday, perfectly aligned.
          </p>
          <div className="mt-10 space-y-4 text-left">
            {[
              {
                title: "Attendance Tracking",
                desc: "One-click check-in/out for your entire team",
              },
              {
                title: "Leave Management",
                desc: "Automated approvals & balance tracking",
              },
              {
                title: "Employee Directory",
                desc: "All your team info in one place",
              },
              {
                title: "Payroll Ready",
                desc: "Auto-calculated salary components",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10"
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {f.title}
                  </div>
                  <div className="text-xs text-slate-400">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-col items-center justify-center bg-slate-50 px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-6 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Dayflow
          </span>
        </div>

        <div className="w-full max-w-sm">
          {/* Desktop header with icon */}
          <div className="mb-6 hidden flex-col items-center lg:flex">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Dayflow
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create a new organization account
            </p>
          </div>

          {/* Mobile header */}
          <div className="mb-6 lg:hidden">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create your company
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              You&apos;ll be its first admin. Add your team in the next step.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <SignupForm />
          </div>
        </div>
      </div>
    </main>
  );
}