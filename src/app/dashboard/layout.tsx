import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth";
import { signOutAction } from "@/app/actions/auth";
import { ToastContainer } from "@/components/ui/Toast";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/attendance", label: "Attendance" },
  { href: "/leave", label: "Leave" },
  { href: "/employees", label: "Employees" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  // Admin-only nav: approvals queue
  const nav = profile.role === "admin" ? [...NAV_ITEMS, { href: "/approvals", label: "Approvals" }] : NAV_ITEMS;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-14 items-center border-b border-slate-200 px-5">
          <span className="text-lg font-semibold tracking-tight">Dayflow</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <div className="md:pl-60">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="text-sm text-slate-400 md:hidden">Dayflow</div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium leading-tight text-slate-800">{profile.full_name}</div>
              <div className="text-xs capitalize leading-tight text-slate-400">{profile.role}</div>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="px-6 py-6">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}