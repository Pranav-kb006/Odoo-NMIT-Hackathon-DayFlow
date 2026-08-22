import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";

export const metadata = { title: "Dashboard — Dayflow" };

export default async function DashboardHome() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return profile.role === "admin" ? (
    <AdminDashboard profile={profile} />
  ) : (
    <EmployeeDashboard profile={profile} />
  );
}
