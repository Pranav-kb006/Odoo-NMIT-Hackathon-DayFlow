export type Role = "admin" | "employee";
export type LeaveStatus = "pending" | "approved" | "rejected";

export type AttendanceRow = {
  id: string;
  company_id: string;
  user_id: string;
  work_date: string; // YYYY-MM-DD
  check_in: string | null;
  check_out: string | null;
};

export type LeaveRequest = {
  id: string;
  company_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveStatus;
  attachment_url: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type Company = {
  id: string;
  name: string;
  code: string;
  created_at: string;
};

export type LeaveBalance = {
  id: string;
  user_id: string;
  company_id: string;
  leave_type: "paid" | "sick" | "unpaid";
  days_available: number;
};

export type ProfileSummary = {
  id: string;
  full_name: string;
  department: string | null;
  designation: string | null;
  avatar_url: string | null;
  role: Role;
};

export type LeaveRequestWithProfile = LeaveRequest & {
  profiles?: ProfileSummary | null;
  reviewer?: ProfileSummary | null;
};

export type AttendanceWithProfile = AttendanceRow & {
  profiles?: ProfileSummary | null;
  duration_minutes?: number | null;
};
