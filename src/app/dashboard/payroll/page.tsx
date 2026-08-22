import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { AdminPayrollManager } from "@/components/payroll/admin-payroll-manager";

export const metadata = { title: "Payroll Management — Dayflow" };

export default async function PayrollPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard");

  // Payroll loads live from /api/payslips (+ /api/employees roster) on the
  // client; we only pass the company id for scoping.
  return <AdminPayrollManager companyId={profile.company_id} />;
}
