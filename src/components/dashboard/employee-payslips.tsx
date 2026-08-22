import { createClient } from "@/lib/supabase/server";

export type PayslipRow = {
  id: string;
  period_year: number;
  period_month: number;
  payable_days: number;
  base_salary: number;
  hra: number;
  allowances: Record<string, number> | null;
  gross_pay: number;
  deductions: number;
  net_pay: number;
  generated_at: string;
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatPeriod(year: number, month: number): string {
  const m = MONTHS[(month - 1 + 12) % 12];
  return `${m} ${year}`;
}

function formatINR(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export async function EmployeePayslips({ profileId }: { profileId: string }) {
  const db = createClient();

  const { data, error } = await db
    .from("payslips")
    .select(
      "id, period_year, period_month, payable_days, base_salary, hra, allowances, gross_pay, deductions, net_pay, generated_at",
    )
    .eq("profile_id", profileId)
    .order("period_year", { ascending: false })
    .order("period_month", { ascending: false })
    .limit(12);

  const slips: PayslipRow[] = (data ?? []) as PayslipRow[];

  if (error) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
          My Payslips
        </h3>
        <p className="text-sm text-secondary">Could not load payslips.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg">
      <div className="flex items-center justify-between mb-md">
        <h3 className="font-headline-md text-headline-md text-on-surface">
          My Payslips
        </h3>
        <span className="text-xs text-secondary">Last 12 months</span>
      </div>

      {slips.length === 0 ? (
        <p className="text-sm text-secondary">
          No payslips generated yet.
        </p>
      ) : (
        <ul className="divide-y divide-outline-variant">
          {slips.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between py-md first:pt-0 last:pb-0"
            >
              <div>
                <p className="font-body-md text-body-md font-bold text-on-surface">
                  {formatPeriod(s.period_year, s.period_month)}
                </p>
                <p className="text-xs text-secondary">
                  {s.payable_days} payable days · Gross {formatINR(s.gross_pay)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono-md text-mono-md font-bold text-on-surface">
                  {formatINR(s.net_pay)}
                </p>
                <p className="text-xs text-secondary">
                  Deductions {formatINR(s.deductions)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
