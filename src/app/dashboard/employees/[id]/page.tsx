import { createClient } from "@/lib/supabase/server";
import { EmployeeDetail } from "@/components/employees/employee-detail";
import type { Employee } from "@/components/employees/types";

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
  status: string;
};

type LeaveRow = {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  status: string;
  reviewer_comment: string | null;
};

const USER_SELECT =
  "id, role, login_id, first_name, last_name, personal_email, work_email, mobile, department, job_position, manager_id, location, date_of_joining, about, skills, avatar_url, created_at";

function mapRow(row: DirectoryRow): Employee {
  const role: Employee["role"] = row.role === "admin" ? "admin" : "employee";
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
    status: "active",
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
      <p className="text-sm text-slate-600">
        Could not load this employee.
      </p>
    </main>
  );
}

export default async function EmployeeProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const db = createClient();

  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;

  try {
    const { data: me, error: meError } = await db
      .from("users")
      .select("company_id, role")
      .eq("auth_id", user.id)
      .single();

    if (meError || !me) return errorState();

    const callerCompanyId = me.company_id as string;
    const canViewPrivateInfo = me.role === "admin";

    const { data: empRow, error: empError } = await db
      .from("users")
      .select(USER_SELECT)
      .eq("id", id)
      .eq("company_id", callerCompanyId)
      .single();

    if (empError || !empRow) return notFound();

    const employee = mapRow(empRow as DirectoryRow);

    let privateInfo: PrivateInfoRow | null = null;
    if (canViewPrivateInfo) {
      const { data: pi, error: piError } = await db
        .from("user_private_info")
        .select("*")
        .eq("user_id", id)
        .maybeSingle();
      if (piError) return errorState();
      privateInfo = (pi as PrivateInfoRow) ?? null;
    }

    const { data: docs, error: docsError } = await db
      .from("user_documents")
      .select("id, doc_type, file_url, file_size_bytes, uploaded_at")
      .eq("user_id", id)
      .eq("company_id", callerCompanyId);

    if (docsError) return errorState();

    const { data: attendance, error: attError } = await db
      .from("attendance")
      .select("work_date, check_in, check_out, status")
      .eq("user_id", id)
      .order("work_date", { ascending: false })
      .limit(50);

    if (attError) return errorState();

    const { data: leaves, error: leaveError } = await db
      .from("leave_requests")
      .select(
        "id, leave_type, start_date, end_date, days_requested, status, reviewer_comment",
      )
      .eq("user_id", id)
      .order("start_date", { ascending: false })
      .limit(50);

    if (leaveError) return errorState();

    const fullName = `${employee.first_name} ${employee.last_name}`.trim();

    return (
      <main className="p-6">
        <h1 className="mb-4 text-xl font-semibold">{fullName}</h1>
        <EmployeeDetail
          employee={employee}
          privateInfo={privateInfo}
          documents={(docs as DocumentRow[]) ?? []}
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
