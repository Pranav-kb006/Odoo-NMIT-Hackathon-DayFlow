import { createClient } from "@/lib/supabase/server";
import { EmployeeDirectory } from "@/components/employees/employee-directory";
import { mapProfileToEmployee, type ProfileRow } from "@/lib/employees";
import type { Employee, EmployeeStats } from "@/components/employees/types";

/** Directory page — maps real `profiles` rows to the UI Employee shape. */

export const metadata = { title: "Employees — Dayflow" };

export default async function EmployeesPage() {
  const db = createClient();

  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;

  // Resolve the caller's company from their own profile (server-side only).
  const { data: me } = await db
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!me) {
    return (
      <main className="p-6">
        <h1 className="mb-4 text-xl font-semibold">Employees</h1>
        <p className="text-sm text-slate-600">Could not load employees.</p>
      </main>
    );
  }

  const { data, error } = await db
    .from("profiles")
    .select(
      "id, company_id, full_name, email, role, department, designation, joined_on, phone, avatar_url, login_id, status, created_at",
    )
    .eq("company_id", me.company_id)
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <main className="p-6">
        <h1 className="mb-4 text-xl font-semibold">Employees</h1>
        <p className="text-sm text-slate-600">Could not load employees.</p>
      </main>
    );
  }

  const rows = (data ?? []) as ProfileRow[];
  const initialEmployees: Employee[] = rows.map(mapProfileToEmployee);

  // Any employee can be referenced as a manager, so use the full list.
  const managers: Employee[] = initialEmployees;

  const initialStats: EmployeeStats = {
    total: initialEmployees.length,
    active: initialEmployees.filter((e) => e.status !== "inactive").length,
    present: 0, // live presence lives on the attendance dashboard
    onLeave: 0, // computed live on the leave page
  };

  return (
    <EmployeeDirectory
      initialEmployees={initialEmployees}
      managers={managers}
      initialStats={initialStats}
    />
  );
}