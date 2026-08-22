// Global runtime helpers used by the payroll UI to share the employee roster
// between the initial roster fetch and the payroll reload.
interface Window {
  __payrollEmployees?: import("@/lib/payroll").DBProfile[];
}
