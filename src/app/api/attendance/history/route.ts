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

  const url = new URL(request.url);
  const targetUserId = url.searchParams.get("userId") || user.id;

  // If viewing another user's history, ensure requester is admin
  if (targetUserId !== user.id && profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const year = parseInt(url.searchParams.get("year") || String(now.getFullYear()), 10);
  const month = parseInt(url.searchParams.get("month") || String(now.getMonth() + 1), 10);

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  const { data: rows, error } = await db
    .from("attendance")
    .select("*")
    .eq("user_id", targetUserId)
    .gte("work_date", startDate)
    .lt("work_date", endDate)
    .order("work_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate statistics
  let totalMinutes = 0;
  let presentDays = 0;

  const recordsWithDuration = (rows || []).map((row) => {
    let durationMinutes: number | null = null;
    if (row.check_in && row.check_out) {
      const diffMs = new Date(row.check_out).getTime() - new Date(row.check_in).getTime();
      if (diffMs > 0) {
        durationMinutes = Math.round(diffMs / (1000 * 60));
        totalMinutes += durationMinutes;
      }
    }
    if (row.check_in) {
      presentDays++;
    }
    return {
      ...row,
      duration_minutes: durationMinutes,
    };
  });

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const avgHoursPerDay =
    presentDays > 0 ? Math.round((totalMinutes / 60 / presentDays) * 10) / 10 : 0;

  return NextResponse.json({
    records: recordsWithDuration,
    stats: {
      presentDays,
      totalHours,
      avgHoursPerDay,
      period: { year, month },
    },
  });
}
