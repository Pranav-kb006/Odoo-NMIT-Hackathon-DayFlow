/**
 * Salary Component Breakdown & Payroll Utilities
 * According to PRD §5.6
 */

export type SalaryBreakdown = {
  monthlyWage: number;
  basic: number;
  hra: number;
  standardAllowance: number;
  performanceBonus: number;
  lta: number;
  fixedAllowance: number;
  employeePf: number;
  employerPf: number;
  professionalTax: number;
  totalDeductions: number;
  netPay: number;
};

export function calculateSalaryBreakdown(monthlyWage: number): SalaryBreakdown {
  const basic = Math.round(monthlyWage * 0.5);
  const hra = Math.round(basic * 0.5);
  const standardAllowance = 4167;
  const performanceBonus = Math.round(basic * 0.0833);
  const lta = Math.round(basic * 0.08333);
  
  const computedSum = basic + hra + standardAllowance + performanceBonus + lta;
  const fixedAllowance = Math.max(0, monthlyWage - computedSum);
  
  const employeePf = Math.round(basic * 0.12);
  const employerPf = Math.round(basic * 0.12);
  const professionalTax = 200;
  
  const totalDeductions = employeePf + professionalTax;
  const netPay = Math.max(0, monthlyWage - totalDeductions);

  return {
    monthlyWage,
    basic,
    hra,
    standardAllowance,
    performanceBonus,
    lta,
    fixedAllowance,
    employeePf,
    employerPf,
    professionalTax,
    totalDeductions,
    netPay,
  };
}

export type PayrollItem = {
  id: string;
  empId: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  monthlyWage: number;
  deductions: number;
  netPay: number;
  status: "paid" | "processing" | "pending";
  /** True when no salary structure is configured for this employee yet. */
  noSalary?: boolean;
};

export type DBProfile = {
  id: string;
  full_name: string;
  email?: string | null;
  role: string;
  department?: string | null;
  designation?: string | null;
  avatar_url?: string | null;
  status?: string | null;
  created_at?: string;
};

/**
 * Determine default base wage based on employee designation/department.
 */
export function estimateMonthlyWage(designation?: string | null, department?: string | null): number {
  const title = (designation || department || "").toLowerCase();
  if (title.includes("director") || title.includes("head") || title.includes("vp")) return 12500;
  if (title.includes("manager") || title.includes("lead")) return 9500;
  if (title.includes("senior") || title.includes("architect")) return 8800;
  if (title.includes("designer") || title.includes("engineer") || title.includes("developer")) return 7800;
  if (title.includes("intern") || title.includes("junior")) return 5000;
  return 7500; // Default company base
}

/**
 * Maps Supabase Profile rows to UI PayrollItems dynamically.
 */
export function mapProfileToPayrollItem(
  profile: DBProfile,
  customWage?: number,
  overrideStatus?: "paid" | "processing" | "pending"
): PayrollItem {
  const wage = customWage ?? estimateMonthlyWage(profile.designation, profile.department);
  const breakdown = calculateSalaryBreakdown(wage);
  
  // Hash profile ID for deterministic default status if not provided
  let status: "paid" | "processing" | "pending" = overrideStatus ?? "pending";
  if (!overrideStatus) {
    const charCodeSum = profile.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    if (charCodeSum % 3 === 0) status = "paid";
    else if (charCodeSum % 3 === 1) status = "processing";
    else status = "pending";
  }

  return {
    id: profile.id,
    empId: `EMP-${profile.id.slice(0, 4).toUpperCase()}`,
    name: profile.full_name,
    role: profile.designation || profile.department || (profile.role === "admin" ? "Administrator" : "Employee"),
    avatarUrl: profile.avatar_url,
    monthlyWage: wage,
    deductions: breakdown.totalDeductions,
    netPay: breakdown.netPay,
    status,
  };
}
