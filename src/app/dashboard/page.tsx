import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { AdminDashboard, type AdminStats } from "@/components/dashboard/admin-dashboard";
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";

export const metadata = { title: "Dashboard — Dayflow" };

export default async function DashboardHome() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (profile.role === "admin") {
    const db = createClient();

    // Real counts, scoped by RLS to the admin's company.
    const [{ count: headcount }, { count: presentToday }, { count: pendingLeaves }] =
      await Promise.all([
        db.from("profiles").select("*", { count: "exact", head: true }).eq("company_id", profile.company_id),
        db
          .from("attendance")
          .select("*", { count: "exact", head: true })
          .eq("company_id", profile.company_id)
          .eq("work_date", new Date().toISOString().slice(0, 10))
          .not("check_in", "is", null),
        db
          .from("leave_requests")
          .select("*", { count: "exact", head: true })
          .eq("company_id", profile.company_id)
          .eq("status", "pending"),
      ]);

    const stats: AdminStats = {
      headcount: headcount ?? 0,
      presentToday: presentToday ?? 0,
      pendingLeaves: pendingLeaves ?? 0,
    };

    return <AdminDashboard profile={profile} stats={stats} />;
  }

  return <EmployeeDashboard profile={profile} />;
}