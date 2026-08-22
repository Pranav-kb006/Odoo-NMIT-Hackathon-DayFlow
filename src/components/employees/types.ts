export type Role = "admin" | "employee";

export type Employee = {
  id: string;
  role: Role;
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
  status?: "active" | "inactive";
};

export type EmployeeFormValues = {
  first_name: string;
  last_name: string;
  personal_email: string;
  work_email: string;
  mobile: string;
  date_of_joining: string;
  department: string;
  job_position: string;
  manager_id: string;
  location: string;
};

export type EmployeeCreateResponse = {
  employee: Employee;
  credentials: { login_email: string; temporary_password: string };
};

export type CsvRowError = { row: number; field?: string; message: string };
export type CsvEmployeeRow = EmployeeFormValues & { source_row: number };
export type CsvParseResult = {
  rows: CsvEmployeeRow[];
  errors: CsvRowError[];
  totalRows: number;
};
export type ExportEmployee = Pick<
  Employee,
  | "login_id"
  | "first_name"
  | "last_name"
  | "work_email"
  | "department"
  | "job_position"
  | "date_of_joining"
  | "location"
  | "mobile"
>;
export type EmployeeStats = {
  total: number;
  active: number;
  present: number;
  onLeave: number;
};
export type CsvImportSummary = {
  created: EmployeeCreateResponse[];
  failures: { row: number; message: string }[];
};
