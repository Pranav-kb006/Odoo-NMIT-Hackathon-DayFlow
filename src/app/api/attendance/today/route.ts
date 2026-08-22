import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const today = new Date().toISOString().split("T")[0];
  const url = new URL(request.url);
  const scope = url.searchParams.get("scope");

  // Admin scope requested
  if (scope === "company" && profile.role === "admin") {
    const { data: teamAttendance, error: teamError } = await db
      .from("attendance")
      .select("*, profiles:user_id (id, full_name, department, designation, avatar_url, role)")
      .eq("company_id", profile.company_id)
      .eq("work_date", today);

    if (teamError) {
      return NextResponse.json({ error: teamError.message }, { status: 500 });
    }

    return NextResponse.json({ attendance: teamAttendance ?? [] });
  }

  // Default: current user's today attendance
  const { data: todayAttendance, error } = await db
    .from("attendance")
    .select("*")
    .eq("user_id", user.id)
    .eq("work_date", today)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    attendance: todayAttendance ?? null,
    work_date: today,
  });
}
