import type { Employee } from "@/components/employees/types";

/** Raw profiles row as returned by /api/employees. */
export type ProfileRow = {
  id: string;
  company_id: string;
  full_name: string;
  email?: string | null;
  role: "admin" | "employee" | string;
  department: string | null;
  designation: string | null;
  joined_on: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: "active" | "inactive" | string;
  created_at: string;
  login_id?: string | null;
};

function splitName(full: string): { first: string; last: string } {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

/**
 * Single source of truth for profiles-row → UI Employee.
 * Used by the server page AND by the client after every API mutation,
 * so nothing raw ever enters component state.
 */
export function mapProfileToEmployee(row: ProfileRow): Employee {
  const { first, last } = splitName(row.full_name);
  return {
    id: row.id,
    role: row.role === "admin" ? "admin" : "employee",
    login_id: row.login_id ?? row.id.slice(0, 8),
    first_name: first,
    last_name: last,
    personal_email: null,
    work_email: row.email ?? "",
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