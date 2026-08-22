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
    .select("id, company_id, full_name, email, role, department, designation, joined_on, phone, avatar_url, login_id, status, created_at")
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
 * Accept BOTH contracts: camelCase (API-native) and the directory form's
 * snake_case EmployeeFormValues (first_name/last_name/work_email/...).
 * Mapped here so neither side has to know about the other.
 */
function normalizeCreateInput(raw: Record<string, unknown>) {
  const fullName =
    typeof raw.fullName === "string" && raw.fullName.trim()
      ? raw.fullName
      : [raw.first_name, raw.last_name].filter(Boolean).join(" ").trim();
  const email =
    typeof raw.email === "string" && raw.email ? raw.email : raw.work_email;

  return {
    fullName: typeof fullName === "string" ? fullName : "",
    email: typeof email === "string" ? email : "",
    password: typeof raw.password === "string" ? raw.password : undefined,
    department: typeof raw.department === "string" ? raw.department : "",
    designation:
      typeof raw.job_position === "string"
        ? raw.job_position
        : typeof raw.designation === "string"
          ? raw.designation
          : null,
    phone:
      typeof raw.mobile === "string"
        ? raw.mobile
        : typeof raw.phone === "string"
          ? raw.phone
          : null,
    role: raw.role === "admin" ? "admin" : "employee",
  };
}

/** Split "First Last" → { first, last } treating all after first as last. */
function parseFullName(full: string): { first: string; last: string } {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "X" };
  return { first: parts[0], last: parts.slice(1).join("") };
}

/**
 * PRD login-id format:
 * {CompanyCode}{first2(first)}{first2(last)}{yearOfJoining}{4-digit serial}
 * e.g. DFJODO20260001
 */
function buildLoginId(
  companyCode: string,
  fullName: string,
  joinedOn: string,
  serial: number,
): string {
  const { first, last } = parseFullName(fullName);
  const year = joinedOn.slice(0, 4) || new Date().getFullYear().toString();
  const first2 = (code: string) => code.slice(0, 2).toUpperCase().padEnd(2, "X");
  const code = (companyCode || "DF").toUpperCase().slice(0, 4);
  return `${code}${first2(first)}${first2(last)}${year}${serial.toString().padStart(4, "0")}`;
}

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
    const raw = (await request.json()) as Record<string, unknown>;
    const parsed = createEmployeeSchema.parse(normalizeCreateInput(raw));
    // honor the form's date_of_joining when provided, else today
    const joinedOn =
      typeof raw.date_of_joining === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.date_of_joining)
        ? raw.date_of_joining
        : new Date().toISOString().slice(0, 10);
    const password = parsed.password ?? "Dayflow#2026"; // demo default; admin should reset

    const admin = createAdminClient();

    // Company code + serial for the login_id ({code}{first2}{last2}{year}{serial}).
    const { data: company } = await admin
      .from("companies")
      .select("code")
      .eq("id", me.company_id)
      .single();
    const { count: existingCount } = await admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("company_id", me.company_id);
    const serial = (existingCount ?? 0) + 1;
    const companyCode = (company?.code ?? "DF").toUpperCase();

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

    const loginId = buildLoginId(companyCode, parsed.fullName, joinedOn, serial);

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
        joined_on: joinedOn,
        login_id: loginId,
        status: "active",
      })
      .select()
      .single();

    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id); // roll back
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Directory UI expects credentials to show in a dialog after creation.
    return NextResponse.json(
      {
        employee: profile,
        credentials: {
          login_email: parsed.email,
          login_id: loginId,
          temporary_password: password,
        },
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Invalid request data";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}