"use client";

import { useState, useTransition, type FormEvent } from "react";
import { signInAction } from "@/app/actions/auth";

export default function LoginForm() {
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false);

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
    <form onSubmit={onSubmit} className="w-full flex flex-col gap-lg">
      {/* Login ID / Email */}
      <div className="flex flex-col gap-xs">
        <label
          htmlFor="email"
          className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider"
        >
          Login Id/Email
        </label>
        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            onFocus={() => setShowHint(true)}
            onBlur={(e) => !e.target.value && setShowHint(false)}
            placeholder="e.g. OIJODO20220001"
            className="w-full bg-surface-container-lowest border border-secondary-fixed rounded-lg px-md py-3 font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
        {showHint && (
          <p className="font-mono-sm text-mono-sm text-outline mt-1" id="idFormatHint">
            Format: [Org][Name][Year][Serial]
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-xs">
        <div className="flex justify-between items-center">
          <label
            htmlFor="password"
            className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider"
          >
            Password
          </label>
          <a className="font-label-md text-label-md text-primary hover:underline" href="/forgot-password">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            className="w-full bg-surface-container-lowest border border-secondary-fixed rounded-lg px-md py-3 pr-12 font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
            tabIndex={-1}
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? "visibility" : "visibility_off"}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <p className="font-body-md text-body-md rounded-lg bg-error-container px-3 py-2 text-on-error-container">
          {error}
        </p>
      )}

      {/* Submit Action */}
      <div className="mt-md flex flex-col gap-md">
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-primary text-on-primary font-label-md text-label-md rounded-lg py-3 px-6 hover:bg-on-surface transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {pending ? "SIGNING IN..." : "SIGN IN"}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-xl text-center border-t border-secondary-fixed w-full pt-lg">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <a className="text-primary font-bold hover:underline ml-1" href="/signup">
            Create Company
          </a>
        </p>
      </div>
    </form>
  );
}