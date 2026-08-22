import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/payslips?year=2026&month=8 — returns the company's payslips for the
 * given month plus each employee's latest salary structure (base wage). Admin
 * or employee (own only) scoped via RLS.
 */
export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const year = Number(url.searchParams.get("year") ?? new Date().getFullYear());
  const month = Number(url.searchParams.get("month") ?? new Date().getMonth() + 1);

  // Employee scope: only their own payslip.
  let payslipQuery = db
    .from("payslips")
    .select("*")
    .eq("company_id", me.company_id)
    .eq("period_year", year)
    .eq("period_month", month);
  if (me.role !== "admin") payslipQuery = payslipQuery.eq("profile_id", user.id);
  const { data: payslips, error: pErr } = await payslipQuery;
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  // Latest salary structure per employee in the company.
  const { data: salaries } = await db
    .from("salary_structures")
    .select("profile_id, base_salary, hra, deduction_pct")
    .eq("company_id", me.company_id);

  const salaryMap: Record<string, { base: number; hra: number; deductionPct: number }> = {};
  for (const s of salaries ?? []) {
    salaryMap[s.profile_id] = {
      base: Number(s.base_salary),
      hra: Number(s.hra ?? 0),
      deductionPct: Number(s.deduction_pct ?? 0),
    };
  }

  return NextResponse.json({ payslips: payslips ?? [], salaryMap });
}
