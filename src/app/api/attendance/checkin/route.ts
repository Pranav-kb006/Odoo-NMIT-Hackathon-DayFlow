import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const db = createClient();
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user profile to get company_id
  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toISOString();

  // Check if today's record already exists
  const { data: existing } = await db
    .from("attendance")
    .select("*")
    .eq("user_id", user.id)
    .eq("work_date", today)
    .maybeSingle();

  if (existing?.check_in) {
    return NextResponse.json(
      { message: "Already checked in today", attendance: existing },
      { status: 200 }
    );
  }

  if (existing) {
    // Record exists without check_in, update it
    const { data: updated, error: updateError } = await db
      .from("attendance")
      .update({ check_in: now })
      .eq("id", existing.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    return NextResponse.json({ attendance: updated });
  }

  // Insert new attendance record for today
  const { data: inserted, error: insertError } = await db
    .from("attendance")
    .insert({
      company_id: profile.company_id,
      user_id: user.id,
      work_date: today,
      check_in: now,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ attendance: inserted }, { status: 201 });
}
