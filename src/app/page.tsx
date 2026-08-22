export default function Landing() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-semibold tracking-tight">
        Every workday, <span className="text-accent">perfectly aligned</span>.
      </h1>
      <p className="mt-4 max-w-md text-slate-500">
        Attendance, leave, and your whole team — one calm dashboard. Built for
        small companies that hate paperwork.
      </p>
      <div className="mt-8 flex gap-3">
        <a
          href="/signup"
          className="rounded-lg bg-accent px-6 h-11 leading-[2.75rem] text-white font-medium hover:bg-accent-dark transition-colors"
        >
          Create your company
        </a>
        <a
          href="/login"
          className="rounded-lg border border-slate-200 bg-white px-6 h-11 leading-[2.75rem] font-medium hover:bg-slate-50 transition-colors"
        >
          Sign in
        </a>
      </div>
      <p className="absolute bottom-6 text-xs text-slate-400">
        Dayflow · Odoo × NMIT Hackathon
      </p>
    </main>
  );
}
