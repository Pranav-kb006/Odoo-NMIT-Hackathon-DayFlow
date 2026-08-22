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
    const patch = updateSchema.parse(await request.json());

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