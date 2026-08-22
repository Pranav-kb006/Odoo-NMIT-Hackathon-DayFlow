import LoginForm from "@/components/auth/login-form";
import { LayoutDashboard } from "lucide-react";

export const metadata = { title: "Sign in — Dayflow" };

export default function LoginPage() {
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
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
              <div className="mb-2 text-2xl font-bold text-accent">142</div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Employees
              </div>
            </div>
            <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
              <div className="mb-2 text-2xl font-bold text-green-400">94%</div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Attendance
              </div>
            </div>
            <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
              <div className="mb-2 text-2xl font-bold text-amber-400">5</div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Pending
              </div>
            </div>
            <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
              <div className="mb-2 text-2xl font-bold text-purple-400">2</div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Holidays
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-col items-center justify-center bg-slate-50 px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Dayflow
          </span>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="mb-1 text-center text-2xl font-bold tracking-tight text-slate-900">
            Welcome Back
          </h1>
          <p className="mb-8 text-center text-sm text-slate-500">
            Sign in to access your HR dashboard.
          </p>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}