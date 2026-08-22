import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/employees — directory list for the caller's company.
 * Any authenticated member of the company can read (RLS also enforces).
 */
export async function GET() {
  const db = createClient();
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: me } = await db
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();
  if (!me) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data, error } = await db
    .from("profiles")
    .select("id, company_id, full_name, email, role, department, designation, joined_on, phone, avatar_url, status, created_at")
    .eq("company_id", me.company_id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ employees: data ?? [] });
}

const createEmployeeSchema = z.object({
  fullName: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password at least 8 characters").optional(),
  department: z.string().min(2, "Department required"),
  designation: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.enum(["admin", "employee"]).default("employee"),
});

/**
 * POST /api/employees — admin-only. Creates an auth user (confirmed, with the
 * given or generated password), then their profile row. Email is mirrored onto
 * profiles because PostgREST can't join auth.users.
 */
export async function POST(request: Request) {
  const db = createClient();
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: me } = await db
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();
  if (!me) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  if (me.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const parsed = createEmployeeSchema.parse(await request.json());
    const password = parsed.password ?? "Dayflow#2026"; // demo default; admin should reset

    const admin = createAdminClient();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: parsed.email,
      password,
      email_confirm: true,
    });
    if (createError) {
      if (createError.message.includes("already")) {
        return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
      }
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }
    if (!created.user) throw new Error("No user returned");

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .insert({
        id: created.user.id,
        company_id: me.company_id,
        full_name: parsed.fullName,
        email: parsed.email,
        role: parsed.role,
        department: parsed.department,
        designation: parsed.designation ?? null,
        phone: parsed.phone ?? null,
        joined_on: new Date().toISOString().slice(0, 10),
        status: "active",
      })
      .select()
      .single();

    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id); // roll back
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ employee: profile }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Invalid request data";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}