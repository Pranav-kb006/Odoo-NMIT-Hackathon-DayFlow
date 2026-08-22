import { createClient } from "@/lib/supabase/server";
import { EmployeeDirectory } from "@/components/employees/employee-directory";
import type { Employee, EmployeeStats } from "@/components/employees/types";

/**
 * Directory page — reads the REAL `profiles` table (not the phantom `users`
 * table the UI was originally written against). Nithin's Employee shape needs
 * first_name/last_name/work_email/login_id, which we derive from
 * profiles.full_name / profiles.email / profiles.id.
 */
type ProfileRow = {
  id: string;
  company_id: string;
  full_name: string;
  email: string | null;
  role: "admin" | "employee" | string;
  department: string | null;
  designation: string | null;
  joined_on: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: "active" | "inactive" | string;
  created_at: string;
};

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function mapRow(row: ProfileRow): Employee {
  const { first, last } = splitName(row.full_name);
  return {
    id: row.id,
    role: row.role === "admin" ? "admin" : "employee",
    login_id: row.id.slice(0, 8), // display-only handle; real identity is email
    first_name: first,
    last_name: last,
    personal_email: null,
    work_email: row.email ?? "—",
    mobile: row.phone,
    department: row.department,
    job_position: row.designation,
    manager_id: null,
    location: null,
    date_of_joining: row.joined_on ?? "",
    about: null,
    skills: null,
    avatar_url: row.avatar_url,
    created_at: row.created_at,
    status: row.status === "inactive" ? "inactive" : "active",
  };
}

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
      "id, company_id, full_name, email, role, department, designation, joined_on, phone, avatar_url, status, created_at",
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
  const initialEmployees: Employee[] = rows.map(mapRow);

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