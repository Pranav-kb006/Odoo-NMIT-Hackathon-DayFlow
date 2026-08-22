"use client";

import { useState, useTransition, type FormEvent } from "react";

import { signUpAction } from "@/app/actions/auth";

export default function SignupForm() {
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    setError(undefined);
    startTransition(async () => {
      const result = await signUpAction(undefined, formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="companyName" className="mb-1 block text-sm font-medium text-slate-700">
          Company name
        </label>
        <input
          id="companyName"
          name="companyName"
          required
          minLength={2}
          className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div>
        <label htmlFor="companyCode" className="mb-1 block text-sm font-medium text-slate-700">
          Company code (2–4 letters, used in employee IDs)
        </label>
        <input
          id="companyCode"
          name="companyCode"
          required
          pattern="[A-Za-z]{2,4}"
          maxLength={4}
          className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm uppercase focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div>
        <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-700">
          Your name
        </label>
        <input
          id="fullName"
          name="fullName"
          required
          minLength={2}
          autoComplete="name"
          className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-10 w-full rounded-lg bg-accent font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create my company"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Already set up?{" "}
        <a href="/login" className="font-medium text-accent hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
}