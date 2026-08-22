import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Users,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
} from "lucide-react";

export default function Landing() {
  return (
    <main className="min-h-screen bg-white">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Dayflow
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Sign in
            </a>
            <a
              href="/signup"
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/5 blur-3xl animate-float" />
          <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-purple-100/50 blur-3xl animate-float-delayed" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-100/40 blur-3xl animate-float-slow" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 text-center lg:pb-28 lg:pt-28">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
            <Zap className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-semibold text-accent">
              Built for the Odoo × NMIT Hackathon
            </span>
          </div>

          <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-accent to-blue-600 bg-clip-text text-transparent">
              Dayflow
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-500">
            Attendance, leave, and your whole team — one calm dashboard. Built
            for small companies that hate paperwork.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-200 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/25"
            >
              Create your company
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
            >
              Sign in
            </a>
          </div>

          {/* Trust markers */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              <span>Secure by default</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>Multi-tenant ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              <span>Instant setup</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Dashboard Preview ─── */}
      <section className="relative mx-auto max-w-5xl px-6 pb-20">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
          {/* Mock browser bar */}
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <div className="ml-3 flex-1 rounded-md bg-white px-3 py-1 text-xs text-slate-400 border border-slate-100">
              dayflow.vercel.app/dashboard
            </div>
          </div>
          {/* Mock dashboard content */}
          <div className="flex">
            {/* Mini sidebar */}
            <div className="hidden w-48 shrink-0 border-r border-slate-100 bg-slate-900 p-3 sm:block">
              <div className="mb-4 flex items-center gap-2 px-2">
                <div className="h-6 w-6 rounded bg-accent" />
                <span className="text-sm font-semibold text-white">
                  Dayflow
                </span>
              </div>
              {["Dashboard", "Directory", "Attendance", "Time Off"].map(
                (item, i) => (
                  <div
                    key={item}
                    className={`mb-1 rounded-md px-3 py-2 text-xs font-medium ${
                      i === 0
                        ? "bg-accent/10 text-white"
                        : "text-slate-500"
                    }`}
                  >
                    {item}
                  </div>
                )
              )}
            </div>
            {/* Mock content */}
            <div className="flex-1 p-6">
              <div className="mb-4">
                <div className="text-lg font-semibold text-slate-900">
                  Welcome back, Sarah
                </div>
                <div className="text-sm text-slate-500">
                  Here&apos;s what&apos;s happening today.
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Employees", value: "142", color: "text-slate-900" },
                  {
                    label: "Attendance",
                    value: "94%",
                    color: "text-green-600",
                  },
                  {
                    label: "Pending",
                    value: "5",
                    color: "text-amber-600",
                  },
                  {
                    label: "Holidays",
                    value: "2",
                    color: "text-purple-600",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-slate-100 p-3"
                  >
                    <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      {stat.label}
                    </div>
                    <div
                      className={`mt-1 text-xl font-bold ${stat.color}`}
                    >
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Everything you need to manage your team
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-slate-500">
              Built for simplicity. No over-engineering, no feature bloat — just
              the tools a small team actually uses.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: CalendarDays,
                title: "Attendance",
                description:
                  "One-click check-in/out. Real-time status for every employee on your team.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: Clock,
                title: "Time Off",
                description:
                  "Apply, approve, and track leave balances. PTO, sick, and unpaid — all covered.",
                color: "bg-amber-50 text-amber-600",
              },
              {
                icon: Users,
                title: "Directory",
                description:
                  "Complete employee profiles, department filters, and bulk CSV import.",
                color: "bg-green-50 text-green-600",
              },
              {
                icon: LayoutDashboard,
                title: "Payroll",
                description:
                  "Auto-calculated salary components. PF, tax, allowances — all from one wage input.",
                color: "bg-purple-50 text-purple-600",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100"
              >
                <div
                  className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.color}`}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="border-t border-slate-100 py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Ready to simplify your HR?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-500">
            Set up your company in under 2 minutes. No credit card required.
          </p>
          <a
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all duration-200 hover:bg-accent-dark hover:shadow-xl hover:shadow-accent/30"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-100 bg-slate-50 py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-accent text-white">
                <LayoutDashboard className="h-3 w-3" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                Dayflow
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dayflow · Odoo × NMIT Hackathon · Built with ♥ by Team DayFlow
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
