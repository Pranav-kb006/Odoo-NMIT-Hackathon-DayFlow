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
};
