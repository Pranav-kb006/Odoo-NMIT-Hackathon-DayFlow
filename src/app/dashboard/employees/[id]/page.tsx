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
  created_at: string;
};

type PrivateInfoRow = {
  date_of_birth: string | null;
  residing_address: string | null;
  gender: string | null;
  nationality: string | null;
  marital_status: string | null;
  bank_account_number: string | null;
  bank_name: string | null;
  ifsc_code: string | null;
  pan_no: string | null;
  uan_no: string | null;
};

type DocumentRow = {
  id: string;
  doc_type: "resume" | "certification" | "other";
  file_url: string;
  file_size_bytes: number;
  uploaded_at: string;
};

type AttendanceRow = {
  work_date: string;
  check_in: string | null;
  check_out: string | null;
};

type LeaveRow = {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
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
    login_id: row.id.slice(0, 8),
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

    // NOTE: user_private_info / user_documents tables don't exist yet —
    // those queries removed rather than 500-ing the page. Re-add when the
    // schema lands (PRD §48 private info + documents tabs).

    const { data: attendance } = await db
      .from("attendance")
      .select("work_date, check_in, check_out")
      .eq("user_id", id)
      .order("work_date", { ascending: false })
      .limit(50);

    const { data: leaves } = await db
      .from("leave_requests")
      .select("id, start_date, end_date, reason, status, created_at")
      .eq("user_id", id)
      .order("start_date", { ascending: false })
      .limit(50);

    const fullName = `${employee.first_name} ${employee.last_name}`.trim();

    return (
      <main className="p-2 sm:p-4">
        <EmployeeDetail
          employee={employee}
          privateInfo={null}
          documents={[]}
          attendance={(attendance as AttendanceRow[]) ?? []}
          leaveRequests={(leaves as LeaveRow[]) ?? []}
          canViewPrivateInfo={canViewPrivateInfo}
        />
      </main>
    );
  } catch {
    return errorState();
  }
}
