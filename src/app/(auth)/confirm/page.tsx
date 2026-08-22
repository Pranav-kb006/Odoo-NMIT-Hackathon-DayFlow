import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Email-link callback. Supabase reset (and confirm) emails point here with
 * ?token_hash=...&type=recovery. We verify the OTP server-side, establish the
 * session, then send the user to /update-password to set a new password.
 */
export default async function AuthConfirmPage({
  searchParams,
}: {
  searchParams: { token_hash?: string; type?: string };
}) {
  const tokenHash = searchParams.token_hash;
  const type = searchParams.type;

  if (tokenHash && type) {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: type as "recovery" | "email" | "signup",
      token_hash: tokenHash,
    });
    if (!error) redirect("/update-password");
  }

  // Invalid / expired / missing token — bounce to login.
  redirect("/login?error=reset_link_invalid");
}
