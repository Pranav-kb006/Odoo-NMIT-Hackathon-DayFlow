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
    const [{ data: empRow, error: empError }, { data: companyRow }] =
      await Promise.all([
        db
          .from("profiles")
          .select("*")
          .eq("id", id)
          .eq("company_id", callerCompanyId)
          .single(),
        db
          .from("companies")
          .select("name")
          .eq("id", callerCompanyId)
          .single(),
      ]);

    if (empError || !empRow) return notFound();

    const employee = mapRow(empRow as ProfileRow);

    let privateInfo: PrivateInfoRow | null = null;
    if (canViewPrivateInfo) {
      const { data: pi } = await db
        .from("user_private_info")
        .select("*")
        .eq("user_id", id)
        .maybeSingle();
      privateInfo = (pi as PrivateInfoRow) ?? null;
    }

    const { data: docs } = await db
      .from("user_documents")
      .select("id, doc_type, file_url, file_size_bytes, uploaded_at")
      .eq("user_id", id)
      .eq("company_id", callerCompanyId);

    return (
      <main className="p-2 sm:p-4">
        <EmployeeDetail
          employee={employee}
          companyName={companyRow?.name || "—"}
          privateInfo={privateInfo}
          documents={(docs as DocumentRow[]) ?? []}
          canViewPrivateInfo={canViewPrivateInfo}
        />
      </main>
    );
  } catch {
    return errorState();
  }
}
