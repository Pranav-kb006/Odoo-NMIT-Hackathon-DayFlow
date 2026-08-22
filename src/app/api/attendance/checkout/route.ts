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

  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toISOString();

  // Find today's record
  const { data: existing, error: findError } = await db
    .from("attendance")
    .select("*")
    .eq("user_id", user.id)
    .eq("work_date", today)
    .maybeSingle();

  if (findError) {
    return NextResponse.json({ error: findError.message }, { status: 500 });
  }

  if (!existing || !existing.check_in) {
    return NextResponse.json(
      { error: "Cannot check out without checking in first" },
      { status: 400 }
    );
  }

  const { data: updated, error: updateError } = await db
    .from("attendance")
    .update({ check_out: now })
    .eq("id", existing.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ attendance: updated }, { status: 200 });
}
