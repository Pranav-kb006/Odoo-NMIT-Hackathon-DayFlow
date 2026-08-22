import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  company_id: string;
  full_name: string;
  role: "admin" | "employee";
  department: string | null;
  designation: string | null;
  joined_on: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: "active" | "inactive";
};

/** Current user's profile, or null when logged out / missing row. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;

  const { data } = await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile) ?? null;
}
