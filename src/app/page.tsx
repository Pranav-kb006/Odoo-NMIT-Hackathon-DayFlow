"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
  ChevronRight,
  Play,
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
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Rotating Words ─── */
function RotatingWords({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setAnimating(false);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span className="relative inline-block overflow-hidden align-bottom" style={{ height: "1.15em", minWidth: "4ch" }}>
      <span
        className={`absolute left-0 transition-all duration-400 ease-out bg-gradient-to-r from-accent via-blue-600 to-violet-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient ${
          animating
            ? "translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        {words[index]}
      </span>
    </span>
  );
}

/* ─── Floating Particles ─── */
function Particles() {
  return (
    <div className="absolute inset-0 -z-5 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-particle"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor:
              i % 3 === 0
                ? "rgba(59,130,246,0.3)"
                : i % 3 === 1
                ? "rgba(139,92,246,0.25)"
                : "rgba(6,182,212,0.25)",
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${Math.random() * 6 + 6}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Landing() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const heroRef = useRef<HTMLElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  /* track mouse for interactive gradient */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  /* parallax scroll */
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* 3D tilt on dashboard preview */
  const handlePreviewMouse = useCallback((e: React.MouseEvent) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  }, []);

  const resetTilt = useCallback(() => {
    setTilt({ x: 0, y: 0 });
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
      bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
      border: "group-hover:border-blue-200",
    },
    {
      icon: Clock,
      title: "Time Off",
      description:
        "Apply, approve, and track leave balances. PTO, sick, and unpaid — all covered.",
      bg: "bg-gradient-to-br from-amber-50 to-orange-50",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
      border: "group-hover:border-amber-200",
    },
    {
      icon: Users,
      title: "Directory",
      description:
        "Complete employee profiles, department filters, and bulk CSV import.",
      bg: "bg-gradient-to-br from-emerald-50 to-green-50",
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-500",
      border: "group-hover:border-emerald-200",
    },
    {
      icon: LayoutDashboard,
      title: "Payroll",
      description:
        "Auto-calculated salary components. PF, tax, allowances — all from one wage input.",
      bg: "bg-gradient-to-br from-purple-50 to-violet-50",
      iconBg: "bg-gradient-to-br from-purple-500 to-violet-500",
      border: "group-hover:border-purple-200",
    },
  ];

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 border-b border-slate-100/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-blue-600 text-white shadow-lg shadow-accent/25 transition-transform duration-300 hover:scale-110 hover:rotate-3">
              <LayoutDashboard className="h-4 w-4" />
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
              className="relative rounded-xl bg-gradient-to-r from-accent to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02] overflow-hidden group"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative overflow-hidden">
        {/* Interactive gradient mesh background */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 opacity-40 transition-all duration-[2000ms] ease-out"
            style={{
              background: `
                radial-gradient(700px circle at ${mousePos.x}% ${mousePos.y}%, rgba(59,130,246,0.12), transparent 40%),
                radial-gradient(500px circle at ${100 - mousePos.x}% ${100 - mousePos.y}%, rgba(139,92,246,0.08), transparent 40%),
                radial-gradient(800px circle at 20% 80%, rgba(139,92,246,0.06), transparent 50%),
                radial-gradient(600px circle at 80% 20%, rgba(6,182,212,0.06), transparent 50%)
              `,
            }}
          />
          {/* Animated floating orbs */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-accent/10 to-cyan-200/20 blur-3xl animate-float" />
          <div className="absolute -right-32 top-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-200/20 to-pink-100/15 blur-3xl animate-float-delayed" />
          <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-gradient-to-br from-amber-100/20 to-orange-100/15 blur-3xl animate-float-slow" />
          {/* Grid pattern with parallax */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              transform: `translateY(${scrollY * 0.1}px)`,
            }}
          />
          {/* Particles */}
          <Particles />
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-16 pt-24 text-center lg:pb-24 lg:pt-32">
          {/* Animated pill badge */}
          <Reveal>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/15 bg-white/80 backdrop-blur-sm px-5 py-2 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-slate-600">
                Now live — start managing your team today
              </span>
              <ChevronRight className="h-3 w-3 text-slate-400" />
            </div>
          </Reveal>

          {/* Main headline with rotating words */}
          <Reveal delay={100}>
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-8xl leading-[1.1]">
              Manage your team
              <br className="hidden sm:block" />{" "}
              <RotatingWords
                words={["effortlessly", "seamlessly", "brilliantly", "smartly"]}
              />
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
                className="group relative inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/30 hover:scale-[1.03] overflow-hidden"
              >
                {/* shimmer sweep */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="relative z-10 flex items-center gap-2.5">
                  Create your company
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </a>
              <a
                href="/login"
                className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-8 py-4 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-accent/30 hover:bg-white hover:shadow-lg hover:shadow-accent/5 hover:scale-[1.02]"
              >
                <Play className="h-3.5 w-3.5 text-accent" />
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
                  className="group flex items-center gap-2 transition-all duration-300 hover:text-slate-600 cursor-default"
                >
                  <item.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Dashboard Preview with 3D Tilt ─── */}
      <section className="relative mx-auto max-w-5xl px-6 pb-28">
        <Reveal>
          <div
            ref={previewRef}
            className="relative perspective-1000"
            onMouseMove={handlePreviewMouse}
            onMouseLeave={resetTilt}
          >
            {/* Glow effect behind the card */}
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-accent/20 via-purple-500/10 to-cyan-500/20 blur-3xl opacity-50 animate-pulse-slow" />

            <div
              className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/30 transition-transform duration-300 ease-out"
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              }}
            >
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400 transition-all duration-200 hover:bg-red-500 hover:scale-110 cursor-pointer" />
                  <span className="h-3 w-3 rounded-full bg-amber-400 transition-all duration-200 hover:bg-amber-500 hover:scale-110 cursor-pointer" />
                  <span className="h-3 w-3 rounded-full bg-green-400 transition-all duration-200 hover:bg-green-500 hover:scale-110 cursor-pointer" />
                </div>
                <div className="ml-3 flex-1 rounded-lg bg-white px-4 py-1.5 text-xs text-slate-400 border border-slate-100 shadow-inner">
                  <span className="text-slate-300">https://</span>
                  dayflow.vercel.app/dashboard
                </div>
              </div>

              {/* Mock dashboard content */}
              <div className="flex">
                {/* Mini sidebar */}
                <div className="hidden w-52 shrink-0 border-r border-slate-800/10 bg-gradient-to-b from-slate-900 via-slate-850 to-slate-800 p-4 sm:block">
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
                      className={`mb-1 rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-200 cursor-default ${
                        item.active
                          ? "bg-white/10 text-white shadow-sm border-l-2 border-accent"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
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
                      Welcome back, Sarah
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
                        hoverBorder: "hover:border-slate-200",
                      },
                      {
                        label: "Attendance",
                        value: attendance.count,
                        suffix: "%",
                        color: "text-emerald-600",
                        trend: "+3%",
                        trendColor: "text-emerald-500",
                        bg: "bg-emerald-50/50",
                        hoverBorder: "hover:border-emerald-200",
                      },
                      {
                        label: "Pending",
                        value: pending.count,
                        suffix: "",
                        color: "text-amber-600",
                        trend: "-2",
                        trendColor: "text-emerald-500",
                        bg: "bg-amber-50/50",
                        hoverBorder: "hover:border-amber-200",
                      },
                      {
                        label: "Holidays",
                        value: holidays.count,
                        suffix: "",
                        color: "text-violet-600",
                        trend: "This week",
                        trendColor: "text-slate-400",
                        bg: "bg-violet-50/50",
                        hoverBorder: "hover:border-violet-200",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className={`rounded-xl border border-slate-100 p-4 ${stat.bg} transition-all duration-300 hover:shadow-md ${stat.hoverBorder} hover:-translate-y-0.5 cursor-default`}
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

                  {/* Mini chart bars */}
                  <div className="mt-4 flex items-end gap-1 h-12">
                    {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-accent/60 to-accent/20 transition-all duration-500 hover:from-accent hover:to-accent/40 animate-bar-grow"
                          style={{
                            height: `${h}%`,
                            animationDelay: `${i * 80}ms`,
                          }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Marquee Trust Ribbon ─── */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-5 overflow-hidden">
        <div className="animate-marquee flex gap-12 whitespace-nowrap">
          {[...Array(2)].map((_, rep) => (
            <div key={rep} className="flex gap-12 items-center shrink-0">
              {[
                "Secure Authentication",
                "Role-Based Access",
                "Real-Time Updates",
                "Auto Payroll",
                "Leave Management",
                "Employee Directory",
                "One-Click Check-in",
                "PDF Reports",
                "Multi-Company",
                "Cloud Native",
              ].map((text) => (
                <span
                  key={`${rep}-${text}`}
                  className="text-sm font-medium text-slate-400 flex items-center gap-2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/40" />
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="relative border-t border-slate-100 bg-gradient-to-b from-white via-slate-50/30 to-white py-28">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/5 border border-accent/10 px-4 py-1.5 text-xs font-semibold text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                Features
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Everything you need to
                <br />
                <span className="bg-gradient-to-r from-accent to-violet-600 bg-clip-text text-transparent">
                  manage your team
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-slate-500 leading-relaxed text-lg">
                Built for simplicity. No over-engineering, no feature bloat —
                just the tools a small team actually uses.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 100}>
                <div
                  className={`group relative rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-400 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 cursor-default ${feature.border}`}
                >
                  {/* Hover gradient overlay */}
                  <div
                    className={`absolute inset-0 rounded-2xl ${feature.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-400`}
                  />
                  {/* Top gradient line */}
                  <div
                    className={`absolute top-0 left-6 right-6 h-0.5 ${feature.iconBg} rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-x-0 group-hover:scale-x-100`}
                  />

                  <div className="relative">
                    <div
                      className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feature.iconBg} text-white shadow-lg transition-all duration-400 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl`}
                    >
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-base font-bold text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-500">
                      {feature.description}
                    </p>
                    <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-accent opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
                      Learn more
                      <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="border-y border-slate-100 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { value: "99.9%", label: "Uptime SLA", icon: "🟢" },
                { value: "< 50ms", label: "API Response", icon: "⚡" },
                { value: "256-bit", label: "Encryption", icon: "🔒" },
                { value: "24/7", label: "Monitoring", icon: "📊" },
              ].map((stat, i) => (
                <Reveal key={stat.label} delay={i * 80}>
                  <div className="text-center group cursor-default">
                    <div className="text-2xl mb-2 transition-transform duration-300 group-hover:scale-125">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent sm:text-4xl">
                      {stat.value}
                    </div>
                    <div className="mt-1.5 text-sm text-slate-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-28 overflow-hidden">
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-accent/20 to-transparent blur-3xl rounded-full animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-gradient-to-t from-purple-500/10 to-transparent blur-3xl rounded-full" />

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Ready to simplify
              <br />
              <span className="bg-gradient-to-r from-accent to-cyan-400 bg-clip-text text-transparent">
                your HR?
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-slate-400 text-lg">
              Set up your company in under 2 minutes. No credit card required.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="/signup"
                className="group relative inline-flex items-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-slate-900 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
                <span className="relative z-10 flex items-center gap-2.5">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </a>
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-8 py-4 text-sm font-semibold text-white/90 transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02]"
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
            <div className="flex items-center gap-2.5 group cursor-default">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-blue-600 text-white shadow-md shadow-accent/20 transition-transform duration-300 group-hover:rotate-12">
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
