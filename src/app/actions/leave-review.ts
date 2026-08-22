"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

/**
 * Approve / reject a leave request. Double-guarded: the caller must be an
 * admin (checked in code) AND the RLS migration only lets admins update leave
 * rows in their company. Both gates, not one.
 */
export async function reviewLeaveAction(formData: FormData) {
  const id = formData.get("id");
  const rawAction = formData.get("action");
  if (typeof id !== "string" || !id) return;
  if (rawAction !== "approved" && rawAction !== "rejected") return;

  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/login");

  const db = createClient();
  const { error } = await db
    .from("leave_requests")
    .update({
      status: rawAction,
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (!error) revalidatePath("/approvals");
}