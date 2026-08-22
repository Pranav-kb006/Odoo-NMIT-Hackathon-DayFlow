import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";

const salarySchema = z.object({
  baseSalary: z.number().positive("Base salary must be > 0"),
  hra: z.number().min(0).optional().default(0),
  allowances: z.record(z.string(), z.number()).optional().default({}),
  deductionPct: z.number().min(0).max(100).optional().default(0),
});

/**
 * POST /api/employees/[id]/salary — admin sets an employee's salary structure.
 * Upserts the latest effective row for the profile.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
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

  const { data: target } = await db
    .from("profiles")
    .select("company_id")
    .eq("id", params.id)
    .single();
  if (!target) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  if (target.company_id !== me.company_id) {
    return NextResponse.json({ error: "Forbidden: cross-company salary edit" }, { status: 403 });
  }

  try {
    const body = salarySchema.parse(await request.json());
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("salary_structures")
      .upsert(
        {
          company_id: me.company_id,
          profile_id: params.id,
          base_salary: body.baseSalary,
          hra: body.hra,
          allowances: body.allowances,
          deduction_pct: body.deductionPct,
          effective_from: new Date().toISOString().slice(0, 10),
        },
        { onConflict: "profile_id, effective_from" },
      )
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ salary: data }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Invalid request data";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
