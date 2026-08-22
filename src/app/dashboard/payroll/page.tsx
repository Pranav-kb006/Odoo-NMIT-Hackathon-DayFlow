import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminPayrollManager } from "@/components/payroll/admin-payroll-manager";
import { mapProfileToPayrollItem, type DBProfile } from "@/lib/payroll";

export const metadata = { title: "Payroll Management — Dayflow" };

export default async function PayrollPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard");

  const db = createClient();

  // Fetch real employee profiles for the company
  const { data: rawProfiles } = await db
    .from("profiles")
    .select("id, full_name, email, role, department, designation, avatar_url, status, created_at")
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: true });

  const dbProfiles = (rawProfiles ?? []) as DBProfile[];

  // Map real database profiles to PayrollItems
  const initialPayrollItems = dbProfiles.map((p) => mapProfileToPayrollItem(p));

  return <AdminPayrollManager initialItems={initialPayrollItems} />;
}
