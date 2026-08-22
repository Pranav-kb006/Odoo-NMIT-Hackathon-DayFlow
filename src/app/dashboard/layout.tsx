import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth";
import { Sidebar } from "@/components/ui/sidebar";
import { Topbar } from "@/components/ui/topbar";
import { ToastContainer } from "@/components/ui/Toast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar role={profile.role} profile={profile} />
      <Topbar profile={profile} />
      <main className="md:ml-[260px] mt-16 p-xl max-w-[1440px] mx-auto animate-fade-in">
        {children}
      </main>
      <ToastContainer />
    </div>
  );
}