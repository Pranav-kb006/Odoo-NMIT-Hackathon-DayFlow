import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const reviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const db = createClient();
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  const { data: profile } = await db
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Missing leave request ID" }, { status: 400 });
  }

  try {
    const json = await request.json();
    const { status } = reviewSchema.parse(json);
    const now = new Date().toISOString();

    const { data: updated, error: updateError } = await db
      .from("leave_requests")
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: now,
      })
      .eq("id", id)
      .eq("company_id", profile.company_id)
      .select("*, profiles:user_id (id, full_name, department, designation, avatar_url)")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ leaveRequest: updated }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid request data";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
