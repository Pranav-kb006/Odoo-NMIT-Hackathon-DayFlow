"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setPending(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/confirm`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setPending(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full flex flex-col gap-lg text-center">
        <span className="material-symbols-outlined text-[48px] text-primary mx-auto">
          mark_email_read
        </span>
        <p className="font-body-md text-body-md text-on-surface">
          If an account exists for <strong>{email}</strong>, a reset link is on its way.
        </p>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Check your inbox and follow the link to set a new password.
        </p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mt-md w-full bg-primary text-on-primary font-label-md text-label-md rounded-lg py-3 px-6 hover:bg-on-surface transition-colors"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <label
          htmlFor="email"
          className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full bg-surface-container-lowest border border-secondary-fixed rounded-lg px-md py-3 font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
      </div>

      {error && (
        <p className="font-body-md text-body-md rounded-lg bg-error-container px-3 py-2 text-on-error-container">
          {error}
        </p>
      )}

      <div className="mt-md flex flex-col gap-md">
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-primary text-on-primary font-label-md text-label-md rounded-lg py-3 px-6 hover:bg-on-surface transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {pending ? "SENDING..." : "Send Reset Link"}
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full text-primary font-label-md text-label-md hover:underline py-2"
        >
          Back to Sign In
        </button>
      </div>
    </form>
  );
}
