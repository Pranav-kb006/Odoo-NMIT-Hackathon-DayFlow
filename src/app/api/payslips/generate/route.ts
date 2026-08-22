import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { workingDaysBetween } from "@/lib/utils";

const bodySchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
});

/** Count of distinct present days (has check_in) in [start,end] for a user. */
async function presentDays(admin: ReturnType<typeof createAdminClient>, companyId: string, userId: string, start: string, end: string) {
  const { count, error } = await admin
    .from("attendance")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .gte("work_date", start)
    .lte("work_date", end)
    .not("check_in", "is", null);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/** Approved leave days within [start,end] for a user (working days only). */
async function approvedLeaveDays(admin: ReturnType<typeof createAdminClient>, companyId: string, userId: string, start: string, end: string) {
  const { data, error } = await admin
    .from("leave_requests")
    .select("start_date, end_date")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .eq("status", "approved")
    .or(`start_date.lte.${end},end_date.gte.${start}`);
  if (error) throw new Error(error.message);
  let days = 0;
  for (const lv of data ?? []) {
    const s = lv.start_date < start ? start : lv.start_date;
    const e = lv.end_date > end ? end : lv.end_date;
    if (e >= s) days += workingDaysBetween(s, e);
  }
  return days;
}

/**
 * POST /api/payslips/generate — for a company + month, prorate each employee's
 * salary by payable days (present attendance days + approved leave days) vs the
 * working days in that month, and upsert a payslip row per employee.
 */
export async function POST(request: Request) {
  const db = createClient();
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: me } = await db
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();
  if (!me) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  if (me.role !== "admin") return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid year/month" }, { status: 400 });
  }
  const { year, month } = parsed;

  const admin = createAdminClient();
  const firstOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastOfMonth = `${year}-${String(month).padStart(2, "0")}-31`;
  const workingDaysInMonth = workingDaysBetween(firstOfMonth, lastOfMonth);

  // All active employees in the company.
  const { data: employees, error: empErr } = await admin
    .from("profiles")
    .select("id, full_name")
    .eq("company_id", me.company_id)
    .eq("status", "active");
  if (empErr) return NextResponse.json({ error: empErr.message }, { status: 500 });

  const results: unknown[] = [];
  let skipped = 0;

  for (const emp of employees ?? []) {
    // Latest salary structure for this employee.
    const { data: salary } = await admin
      .from("salary_structures")
      .select("base_salary, hra, allowances, deduction_pct")
      .eq("profile_id", emp.id)
      .order("effective_from", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!salary) {
      skipped += 1; // no salary configured — admin must set it first
      continue;
    }

    const present = await presentDays(admin, me.company_id, emp.id, firstOfMonth, lastOfMonth);
    const leave = await approvedLeaveDays(admin, me.company_id, emp.id, firstOfMonth, lastOfMonth);
    const payable = present + leave;
    const factor = workingDaysInMonth > 0 ? Math.min(payable, workingDaysInMonth) / workingDaysInMonth : 0;

    const baseSalary = Number(salary.base_salary);
    const hra = Number(salary.hra ?? 0);
    const allowances = Object.values((salary.allowances as Record<string, number>) ?? {}).reduce((a, b) => a + Number(b), 0);
    const gross = (baseSalary + hra + allowances) * factor;
    const deductions = gross * (Number(salary.deduction_pct ?? 0) / 100);
    const net = Math.max(0, gross - deductions);

    const { data: slip, error: slipErr } = await admin
      .from("payslips")
      .upsert(
        {
          company_id: me.company_id,
          profile_id: emp.id,
          period_year: year,
          period_month: month,
          payable_days: Number(payable.toFixed(1)),
          base_salary: baseSalary,
          hra,
          allowances: salary.allowances ?? {},
          gross_pay: Number(gross.toFixed(2)),
          deductions: Number(deductions.toFixed(2)),
          net_pay: Number(net.toFixed(2)),
        },
        { onConflict: "profile_id, period_year, period_month" },
      )
      .select()
      .single();
    if (slipErr) return NextResponse.json({ error: slipErr.message }, { status: 500 });
    results.push(slip);
  }

  return NextResponse.json({ generated: results.length, skippedNoSalary: skipped, payslips: results });
}
