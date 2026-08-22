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
