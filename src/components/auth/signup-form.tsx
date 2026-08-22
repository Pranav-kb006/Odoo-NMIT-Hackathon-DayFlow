"use client";

import { useState, useTransition, type FormEvent } from "react";
import { signUpAction } from "@/app/actions/auth";

export default function SignupForm() {
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    setError(undefined);

    const pw = formData.get("password") as string;
    const cpw = formData.get("confirmPassword") as string;
    if (pw && cpw && pw !== cpw) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const result = await signUpAction(undefined, formData);
      if (result?.error) setError(result.error);
    });
  };

  const inputClass =
    "w-full h-10 px-md bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-0 focus:outline-none transition-colors font-body-md text-body-md placeholder:text-outline/50";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-md">
      {/* Company Name */}
      <div className="flex flex-col gap-xs">
        <div className="flex items-center justify-between">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="companyName">
            Company Name
          </label>
        </div>
        <input
          id="companyName"
          name="companyName"
          type="text"
          required
          minLength={2}
          placeholder="Enter company name"
          className={inputClass}
        />
      </div>

      {/* Company Code */}
      <div className="flex flex-col gap-xs">
        <label className="font-label-md text-label-md text-on-surface" htmlFor="companyCode">
          Company Code (2–4 letters)
        </label>
        <input
          id="companyCode"
          name="companyCode"
          type="text"
          required
          pattern="[A-Za-z]{2,4}"
          maxLength={4}
          placeholder="e.g. DF"
          className={`${inputClass} uppercase`}
        />
      </div>

      {/* Logo Upload */}
      <div className="flex flex-col gap-xs">
        <label className="font-label-md text-label-md text-on-surface" htmlFor="logo">
          Company Logo (Optional)
        </label>
        <input
          id="logo"
          name="logo"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="block w-full text-sm text-slate-500 file:mr-3 file:h-10 file:rounded-lg file:border-0 file:bg-surface-container-high file:px-4 file:text-sm file:font-medium file:text-primary hover:file:bg-surface-variant cursor-pointer"
        />
      </div>

      {/* Full Name */}
      <div className="flex flex-col gap-xs">
        <label className="font-label-md text-label-md text-on-surface" htmlFor="fullName">
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          minLength={2}
          placeholder="Enter your full name"
          className={inputClass}
        />
      </div>

      {/* Email Address */}
      <div className="flex flex-col gap-xs">
        <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Enter professional email"
          className={inputClass}
        />
      </div>

      {/* Phone Number */}
      <div className="flex flex-col gap-xs">
        <label className="font-label-md text-label-md text-on-surface" htmlFor="phone">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Enter phone number"
          className={inputClass}
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-xs relative">
        <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            placeholder="Create a password"
            className={`${inputClass} pr-10`}
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

      {/* Confirm Password */}
      <div className="flex flex-col gap-xs relative">
        <label className="font-label-md text-label-md text-on-surface" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            required
            minLength={8}
            placeholder="Confirm your password"
            className={`${inputClass} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
            tabIndex={-1}
          >
            <span className="material-symbols-outlined text-[20px]">
              {showConfirm ? "visibility" : "visibility_off"}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <p className="font-body-md text-body-md rounded-lg bg-error-container px-3 py-2 text-on-error-container">
          {error}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={pending}
        className="w-full h-10 bg-primary text-on-primary rounded font-label-md text-label-md mt-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-xs disabled:opacity-60"
      >
        <span>{pending ? "Creating..." : "Sign Up"}</span>
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>

      {/* Footer link */}
      <div className="text-center pt-md border-t border-outline-variant/30 mt-xs">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Already have an account?{" "}
          <a className="text-primary hover:underline font-label-md ml-1" href="/login">
            Sign In
          </a>
        </p>
      </div>
    </form>
  );
}