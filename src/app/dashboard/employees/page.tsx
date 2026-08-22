import { createClient } from "@/lib/supabase/server";
import { EmployeeDirectory } from "@/components/employees/employee-directory";
import type { Employee, EmployeeStats } from "@/components/employees/types";

// Shape of the directory-safe columns we allowlist in the server query.
// `status` is intentionally omitted: it does not exist on the documented
// `users` table, and selecting a missing column would error at runtime.
// We default it to "active" during mapping instead.
type DirectoryRow = {
  id: string;
  role: string;
  login_id: string;
  first_name: string;
  last_name: string;
  personal_email: string | null;
  work_email: string;
  mobile: string | null;
  department: string | null;
  job_position: string | null;
  manager_id: string | null;
  location: string | null;
  date_of_joining: string;
  about: string | null;
  skills: string[] | null;
  avatar_url: string | null;
  created_at: string;
};

function mapRow(row: DirectoryRow): Employee {
  const role: Employee["role"] =
    row.role === "admin" ? "admin" : "employee";
  return {
    id: row.id,
    role,
    login_id: row.login_id,
    first_name: row.first_name,
    last_name: row.last_name,
    personal_email: row.personal_email ?? null,
    work_email: row.work_email,
    mobile: row.mobile ?? null,
    department: row.department ?? null,
    job_position: row.job_position ?? null,
    manager_id: row.manager_id ?? null,
    location: row.location ?? null,
    date_of_joining: row.date_of_joining,
    about: row.about ?? null,
    skills: row.skills ?? null,
    avatar_url: row.avatar_url ?? null,
    created_at: row.created_at,
    // `status` is not on the `users` table yet; default to active.
    status: "active",
  };
}

export default async function EmployeesPage() {
  const db = createClient();

  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;

  try {
    // Resolve the caller's company from their own users row (server-side only;
    // never sent to the client). Links via `auth_id`, the FK to auth.users.
    const { data: me, error: meError } = await db
      .from("users")
      .select("company_id")
      .eq("auth_id", user.id)
      .single();

    if (meError || !me) {
      return (
        <main className="p-6">
          <h1 className="mb-4 text-xl font-semibold">Employees</h1>
          <p className="text-sm text-slate-600">
            Could not load employees.
          </p>
        </main>
      );
    }

    const { data, error } = await db
      .from("users")
      .select(
        "id, role, login_id, first_name, last_name, personal_email, work_email, mobile, department, job_position, manager_id, location, date_of_joining, about, skills, avatar_url, created_at",
      )
      .eq("company_id", me.company_id);

    if (error) {
      return (
        <main className="p-6">
          <h1 className="mb-4 text-xl font-semibold">Employees</h1>
          <p className="text-sm text-slate-600">
            Could not load employees.
          </p>
        </main>
      );
    }

    const rows = (data ?? []) as DirectoryRow[];
    const initialEmployees: Employee[] = rows.map(mapRow);

    // Any employee can be referenced as a manager, so use the full list.
    const managers: Employee[] = initialEmployees;

    const initialStats: EmployeeStats = {
      total: initialEmployees.length,
      active: initialEmployees.filter((e) => e.status !== "inactive").length,
      present: 0,
      onLeave: 0,
    };

    return (
      <main className="p-6">
        <h1 className="mb-4 text-xl font-semibold">Employees</h1>
        <EmployeeDirectory
          initialEmployees={initialEmployees}
          managers={managers}
          initialStats={initialStats}
        />
      </main>
    );
  } catch {
    return (
      <main className="p-6">
        <h1 className="mb-4 text-xl font-semibold">Employees</h1>
        <p className="text-sm text-slate-600">Could not load employees.</p>
      </main>
    );
  }
}
