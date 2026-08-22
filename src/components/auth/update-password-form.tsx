"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setPending(false);
    }
  };

  if (done) {
    return (
      <p className="font-body-md text-body-md text-center text-on-surface">
        Password updated. Redirecting to your dashboard…
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <label htmlFor="password" className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
          New Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="w-full bg-surface-container-lowest border border-secondary-fixed rounded-lg px-md py-3 font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
      </div>

      <div className="flex flex-col gap-xs">
        <label htmlFor="confirm" className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
          Confirm Password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter password"
          className="w-full bg-surface-container-lowest border border-secondary-fixed rounded-lg px-md py-3 font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
      </div>

      {error && (
        <p className="font-body-md text-body-md rounded-lg bg-error-container px-3 py-2 text-on-error-container">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-md w-full bg-primary text-on-primary font-label-md text-label-md rounded-lg py-3 px-6 hover:bg-on-surface transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {pending ? "UPDATING..." : "Update Password"}
      </button>
    </form>
  );
}
