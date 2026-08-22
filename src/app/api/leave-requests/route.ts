import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { leaveApplySchema } from "@/lib/validation";

export async function GET(request: Request) {
  const db = createClient();
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await db
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const scope = url.searchParams.get("scope");
  const statusFilter = url.searchParams.get("status");

  // Admin scope requested
  if (scope === "company" && profile.role === "admin") {
    let query = db
      .from("leave_requests")
      .select("*, profiles:user_id (id, full_name, department, designation, avatar_url, role)")
      .eq("company_id", profile.company_id)
      .order("created_at", { ascending: false });

    if (statusFilter && ["pending", "approved", "rejected"].includes(statusFilter)) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ leaveRequests: data ?? [] });
  }

  // Employee's own leaves
  let query = db
    .from("leave_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (statusFilter && ["pending", "approved", "rejected"].includes(statusFilter)) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leaveRequests: data ?? [] });
}

export async function POST(request: Request) {
  const db = createClient();
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await db
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  try {
    const json = await request.json();
    const validated = leaveApplySchema.parse(json);

    const { data: inserted, error: insertError } = await db
      .from("leave_requests")
      .insert({
        company_id: profile.company_id,
        user_id: user.id,
        start_date: validated.startDate,
        end_date: validated.endDate,
        reason: validated.reason,
        attachment_url: validated.attachmentUrl,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ leaveRequest: inserted }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid request data";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
