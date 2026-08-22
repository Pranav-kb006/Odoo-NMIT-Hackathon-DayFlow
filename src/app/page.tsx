"use client";

import { useEffect, useState, useRef } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Users,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Sparkles,
  TrendingUp,
  MousePointerClick,
} from "lucide-react";

/* ─── Animated Counter Hook ─── */
function useCounter(end: number, duration = 2000, start = 0) {
  const [count, setCount] = useState(start);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const startTime = performance.now();
          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(start + (end - start) * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, start]);

  return { count, ref };
}

/* ─── Scroll-Reveal Wrapper ─── */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function Landing() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  /* track mouse for interactive gradient */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const employees = useCounter(142, 2000);
  const attendance = useCounter(94, 1800);
  const pending = useCounter(5, 1200);
  const holidays = useCounter(2, 1000);

  const features = [
    {
      icon: CalendarDays,
      title: "Attendance",
      description:
        "One-click check-in/out. Real-time status for every employee on your team.",
      color: "from-blue-500 to-cyan-400",
      bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
      iconBg: "bg-blue-500",
    },
    {
      icon: Clock,
      title: "Time Off",
      description:
        "Apply, approve, and track leave balances. PTO, sick, and unpaid — all covered.",
      color: "from-amber-500 to-orange-400",
      bg: "bg-gradient-to-br from-amber-50 to-orange-50",
      iconBg: "bg-amber-500",
    },
    {
      icon: Users,
      title: "Directory",
      description:
        "Complete employee profiles, department filters, and bulk CSV import.",
      color: "from-emerald-500 to-green-400",
      bg: "bg-gradient-to-br from-emerald-50 to-green-50",
      iconBg: "bg-emerald-500",
    },
    {
      icon: LayoutDashboard,
      title: "Payroll",
      description:
        "Auto-calculated salary components. PF, tax, allowances — all from one wage input.",
      color: "from-purple-500 to-violet-400",
      bg: "bg-gradient-to-br from-purple-50 to-violet-50",
      iconBg: "bg-purple-500",
    },
  ];

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 border-b border-slate-100/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-blue-600 text-white shadow-lg shadow-accent/25">
              <LayoutDashboard className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Dayflow
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:text-slate-900 hover:bg-slate-50"
            >
              Sign in
            </a>
            <a
              href="/signup"
              className="rounded-xl bg-gradient-to-r from-accent to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02]"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative overflow-hidden">
        {/* Interactive gradient mesh background */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 opacity-30 transition-all duration-[1500ms] ease-out"
            style={{
              background: `
                radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(59,130,246,0.15), transparent 40%),
                radial-gradient(800px circle at 20% 80%, rgba(139,92,246,0.08), transparent 50%),
                radial-gradient(600px circle at 80% 20%, rgba(6,182,212,0.08), transparent 50%)
              `,
            }}
          />
          {/* Animated floating orbs */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-accent/10 to-cyan-200/20 blur-3xl animate-float" />
          <div className="absolute -right-32 top-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-200/20 to-pink-100/15 blur-3xl animate-float-delayed" />
          <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-gradient-to-br from-amber-100/20 to-orange-100/15 blur-3xl animate-float-slow" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-16 pt-24 text-center lg:pb-24 lg:pt-32">
          {/* Animated pill badge */}
          <Reveal>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/15 bg-white/80 backdrop-blur-sm px-5 py-2 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-slate-600">
                Now live — start managing your team today
              </span>
            </div>
          </Reveal>

          {/* Main headline with animated gradient */}
          <Reveal delay={100}>
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-8xl">
              Manage your team{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-accent via-blue-600 to-violet-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  effortlessly
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 8.5C50 2.5 100 2.5 150 6C200 9.5 250 5.5 298 3"
                    stroke="url(#underline-gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="animate-draw-line"
                  />
                  <defs>
                    <linearGradient
                      id="underline-gradient"
                      x1="0"
                      y1="0"
                      x2="300"
                      y2="0"
                    >
                      <stop stopColor="#3B82F6" />
                      <stop offset="0.5" stopColor="#2563EB" />
                      <stop offset="1" stopColor="#7C3AED" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-500 sm:text-xl">
              Attendance, leave, payroll, and your whole team — one calm
              dashboard. Built for companies that value simplicity.
            </p>
          </Reveal>

          {/* CTA Buttons */}
          <Reveal delay={300}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="/signup"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/30 hover:scale-[1.02]"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                Create your company
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="/login"
                className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-8 py-4 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-white hover:shadow-lg hover:scale-[1.02]"
              >
                <MousePointerClick className="h-4 w-4 text-slate-400" />
                Sign in
              </a>
            </div>
          </Reveal>

          {/* Trust markers */}
          <Reveal delay={400}>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400">
              {[
                { icon: Shield, text: "Secure by default" },
                { icon: CheckCircle2, text: "Multi-tenant ready" },
                { icon: Zap, text: "Instant setup" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2 transition-colors duration-200 hover:text-slate-600"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Dashboard Preview ─── */}
      <section className="relative mx-auto max-w-5xl px-6 pb-24">
        <Reveal>
          <div className="relative">
            {/* Glow effect behind the card */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-accent/20 via-purple-500/10 to-cyan-500/20 blur-2xl opacity-60" />

            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/30">
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400 transition-colors hover:bg-red-500" />
                  <span className="h-3 w-3 rounded-full bg-amber-400 transition-colors hover:bg-amber-500" />
                  <span className="h-3 w-3 rounded-full bg-green-400 transition-colors hover:bg-green-500" />
                </div>
                <div className="ml-3 flex-1 rounded-lg bg-white px-4 py-1.5 text-xs text-slate-400 border border-slate-100 shadow-inner">
                  <span className="text-slate-300">https://</span>
                  dayflow.vercel.app/dashboard
                </div>
              </div>

              {/* Mock dashboard content */}
              <div className="flex">
                {/* Mini sidebar */}
                <div className="hidden w-52 shrink-0 border-r border-slate-800/10 bg-gradient-to-b from-slate-900 to-slate-800 p-4 sm:block">
                  <div className="mb-6 flex items-center gap-2.5 px-2">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-accent to-blue-600 shadow-lg shadow-accent/30" />
                    <span className="text-sm font-bold text-white">
                      Dayflow
                    </span>
                  </div>
                  {[
                    { name: "Dashboard", active: true },
                    { name: "Directory", active: false },
                    { name: "Attendance", active: false },
                    { name: "Time Off", active: false },
                    { name: "Payroll", active: false },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className={`mb-1 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                        item.active
                          ? "bg-white/10 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>

                {/* Mock content area */}
                <div className="flex-1 p-6">
                  <div className="mb-5">
                    <div className="text-lg font-bold text-slate-900">
                      Welcome back, Sarah 👋
                    </div>
                    <div className="text-sm text-slate-400 mt-0.5">
                      Here&apos;s what&apos;s happening today.
                    </div>
                  </div>
                  <div
                    ref={employees.ref}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                  >
                    {[
                      {
                        label: "Employees",
                        value: employees.count,
                        suffix: "",
                        color: "text-slate-900",
                        trend: "+12%",
                        trendColor: "text-emerald-500",
                        bg: "bg-slate-50",
                      },
                      {
                        label: "Attendance",
                        value: attendance.count,
                        suffix: "%",
                        color: "text-emerald-600",
                        trend: "+3%",
                        trendColor: "text-emerald-500",
                        bg: "bg-emerald-50/50",
                      },
                      {
                        label: "Pending",
                        value: pending.count,
                        suffix: "",
                        color: "text-amber-600",
                        trend: "-2",
                        trendColor: "text-emerald-500",
                        bg: "bg-amber-50/50",
                      },
                      {
                        label: "Holidays",
                        value: holidays.count,
                        suffix: "",
                        color: "text-violet-600",
                        trend: "This week",
                        trendColor: "text-slate-400",
                        bg: "bg-violet-50/50",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className={`rounded-xl border border-slate-100 p-4 ${stat.bg} transition-all duration-200 hover:shadow-md hover:border-slate-200`}
                      >
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {stat.label}
                        </div>
                        <div
                          className={`mt-1.5 text-2xl font-bold tabular-nums ${stat.color}`}
                        >
                          {stat.value}
                          {stat.suffix}
                        </div>
                        <div
                          className={`mt-1 flex items-center gap-1 text-[10px] font-medium ${stat.trendColor}`}
                        >
                          <TrendingUp className="h-3 w-3" />
                          {stat.trend}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Features ─── */}
      <section className="relative border-t border-slate-100 bg-gradient-to-b from-slate-50/80 to-white py-24">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                Features
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Everything you need to manage your team
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-slate-500 leading-relaxed">
                Built for simplicity. No over-engineering, no feature bloat —
                just the tools a small team actually uses.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 100}>
                <div className="group relative rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-300 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1">
                  {/* Hover gradient overlay */}
                  <div
                    className={`absolute inset-0 rounded-2xl ${feature.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  <div className="relative">
                    <div
                      className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feature.iconBg} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                    >
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-base font-bold text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-500">
                      {feature.description}
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-accent opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      Learn more
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="border-y border-slate-100 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { value: "99.9%", label: "Uptime SLA" },
                { value: "< 50ms", label: "API Response" },
                { value: "256-bit", label: "Encryption" },
                { value: "24/7", label: "Monitoring" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-slate-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-24 overflow-hidden">
        {/* CTA background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-accent/20 to-transparent blur-3xl rounded-full" />

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Ready to simplify your HR?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-slate-400 text-lg">
              Set up your company in under 2 minutes. No credit card required.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="/signup"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-slate-900 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.03]"
              >
                <Sparkles className="h-4 w-4 text-accent" />
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-8 py-4 text-sm font-semibold text-white/90 transition-all duration-300 hover:bg-white/10 hover:border-white/30"
              >
                Sign in to existing account
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-100 bg-white py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-blue-600 text-white shadow-md shadow-accent/20">
                <LayoutDashboard className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-bold text-slate-700">
                Dayflow
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dayflow · Built with ♥ by Team DayFlow
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
