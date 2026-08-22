import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { EmployeeDetail } from "@/components/employees/employee-detail";
import type { Employee } from "@/components/employees/types";

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
  login_id?: string | null;
  created_at: string;
};

type DocumentRow = {
  id: string;
  doc_type: "resume" | "certification" | "other";
  file_url: string;
  file_size_bytes: number;
  uploaded_at: string;
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
    login_id: row.login_id ?? row.id.slice(0, 8),
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

function notFound() {
  return (
    <main className="p-6">
      <p className="text-sm text-slate-600">Employee not found.</p>
    </main>
  );
}

function errorState() {
  return (
    <main className="p-6">
      <p className="text-sm text-slate-600">Could not load this employee profile.</p>
    </main>
  );
}

export default async function EmployeeProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const me = await getCurrentProfile();
  if (!me) return null;

  const db = createClient();
  const callerCompanyId = me.company_id;
  const canViewPrivateInfo = me.role === "admin" || me.id === id;

  try {
    const { data: empRow, error: empError } = await db
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("company_id", callerCompanyId)
      .single();

    if (empError || !empRow) return notFound();

    const employee = mapRow(empRow as ProfileRow);

    const { data: companyRow } = await db
      .from("companies")
      .select("name")
      .eq("id", callerCompanyId)
      .single();

    const { data: docs } = await db
      .from("user_documents")
      .select("id, doc_type, file_url, file_size_bytes, uploaded_at")
      .eq("user_id", id)
      .eq("company_id", callerCompanyId);

    // Latest salary structure for this employee (admin or the employee sees it).
    const { data: salaryRow } = await db
      .from("salary_structures")
      .select("base_salary, hra, allowances, deduction_pct, effective_from")
      .eq("profile_id", id)
      .order("effective_from", { ascending: false })
      .limit(1)
      .maybeSingle();

    return (
      <main className="p-2 sm:p-4">
        <EmployeeDetail
          employee={employee}
          companyName={companyRow?.name || "Dayflow Global"}
          documents={(docs as DocumentRow[]) ?? []}
          salary={salaryRow}
          canViewPrivateInfo={canViewPrivateInfo}
          isCurrentUser={me.id === id}
          isAdmin={me.role === "admin"}
        />
      </main>
    );
  } catch {
    return errorState();
  }
}
