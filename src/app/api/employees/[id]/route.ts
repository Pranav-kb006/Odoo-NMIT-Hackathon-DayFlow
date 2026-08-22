import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  department: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.enum(["admin", "employee"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

/** Map the directory form's snake_case fields onto profiles columns. */
function normalizeUpdateInput(raw: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  const fullName =
    typeof raw.fullName === "string" && raw.fullName.trim()
      ? raw.fullName
      : [raw.first_name, raw.last_name].filter(Boolean).join(" ").trim();
  if (fullName) out.fullName = fullName;
  const email =
    typeof raw.email === "string" && raw.email ? raw.email : raw.work_email;
  if (typeof email === "string" && email) out.email = email;
  if (typeof raw.department === "string") out.department = raw.department;
  if (typeof raw.job_position === "string") out.designation = raw.job_position;
  else if (typeof raw.designation === "string") out.designation = raw.designation;
  if (typeof raw.mobile === "string") out.phone = raw.mobile;
  else if (typeof raw.phone === "string") out.phone = raw.phone;
  if (raw.role === "admin" || raw.role === "employee") out.role = raw.role;
  if (raw.status === "active" || raw.status === "inactive") out.status = raw.status;
  return out;
}

/** PATCH /api/employees/[id] — admin-only profile edit. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

  try {
    const patch = updateSchema.parse(
      normalizeUpdateInput((await request.json()) as Record<string, unknown>),
    );

    const dbUpdate: Record<string, unknown> = {};
    if (patch.fullName !== undefined) dbUpdate.full_name = patch.fullName;
    if (patch.email !== undefined) dbUpdate.email = patch.email;
    if (patch.department !== undefined) dbUpdate.department = patch.department;
    if (patch.designation !== undefined) dbUpdate.designation = patch.designation;
    if (patch.phone !== undefined) dbUpdate.phone = patch.phone;
    if (patch.role !== undefined) dbUpdate.role = patch.role;
    if (patch.status !== undefined) dbUpdate.status = patch.status;

    const admin = createAdminClient();
    // keep auth email in sync when changed
    if (patch.email) {
      await admin.auth.admin.updateUserById(params.id, { email: patch.email });
    }
    const { data, error } = await admin
      .from("profiles")
      .update(dbUpdate)
      .eq("id", params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    return NextResponse.json({ employee: data });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Invalid request data";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}