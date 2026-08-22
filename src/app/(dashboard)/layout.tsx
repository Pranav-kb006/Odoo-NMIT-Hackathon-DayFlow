/**
 * Dashboard shell — sidebar + topbar.
 * TODO(B4): build real nav from DESIGN.md (240px sidebar, active = accent-50).
 * TODO(Pranav): fetch profile via getCurrentProfile() for topbar user menu;
 *               redirect to /login if null.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar placeholder */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-slate-200 bg-white md:block" />
      <div className="md:pl-60">
        {/* Topbar placeholder */}
        <header className="sticky top-0 z-10 flex h-14 items-center border-b border-slate-200 bg-white px-8" />
        <main className="px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
