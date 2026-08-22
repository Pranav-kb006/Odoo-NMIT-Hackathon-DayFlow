"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { signInAction } from "@/app/actions/auth";

export default function LoginForm() {
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    setError(undefined);
    startTransition(async () => {
      const result = await signInAction(undefined, formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <form onSubmit={onSubmit} className="w-full space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500"
        >
          Login ID / Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="e.g. DFJODO20260001"
          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-xs font-medium uppercase tracking-wider text-slate-500"
          >
            Password
          </label>
          <span className="text-xs font-medium text-slate-500 cursor-pointer hover:text-accent transition-colors">
            Forgot password?
          </span>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
            tabIndex={-1}
          >
            {showPassword ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 font-semibold uppercase tracking-wider text-white text-sm transition-all duration-150 hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Signing in…
          </>
        ) : (
          <>
            Sign In
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <a
            href="/signup"
            className="font-semibold text-slate-900 hover:text-accent transition-colors"
          >
            Create your company
          </a>
        </p>
      </div>
    </form>
  );
}