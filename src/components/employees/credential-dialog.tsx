"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type Credentials = {
  /** The email the employee logs in with (their work email). */
  login_email: string;
  temporary_password: string;
};

type Props = {
  credentials: Credentials | null;
  onClose: () => void;
};

type CopyState = "idle" | "email" | "password";

export function CredentialDialog({ credentials, onClose }: Props) {
  const [copied, setCopied] = useState<CopyState>("idle");

  // Clear the transient "Copied!" feedback whenever the dialog is reopened.
  useEffect(() => {
    if (credentials) setCopied("idle");
  }, [credentials]);

  async function copy(value: string, which: CopyState) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      window.setTimeout(() => {
        setCopied((current) => (current === which ? "idle" : current));
      }, 1500);
    } catch {
      // Clipboard may be unavailable (e.g. insecure context); ignore silently.
    }
  }

  // When credentials are null, render nothing — the password must not linger.
  if (!credentials) return null;

  return (
    <Modal open={Boolean(credentials)} onClose={onClose}>
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Employee created — share these credentials
        </h2>
      </div>

      <div className="space-y-4 px-5 py-4">
        <p className="text-sm text-slate-600">
          The employee signs in with their work email and this temporary
          password.
        </p>

        <div>
          <label
            htmlFor="login_email"
            className="text-sm font-medium text-slate-700"
          >
            Email (login)
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="login_email"
              readOnly
              value={credentials.login_email}
              className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 font-mono text-sm text-slate-800 focus:outline-none"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => copy(credentials.login_email, "email")}
            >
              {copied === "email" ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        <div>
          <label
            htmlFor="temporary_password"
            className="text-sm font-medium text-slate-700"
          >
            Temporary password
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="temporary_password"
              readOnly
              value={credentials.temporary_password}
              className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 font-mono text-sm text-slate-800 focus:outline-none"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                copy(credentials.temporary_password, "password")
              }
            >
              {copied === "password" ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          The temporary password is shown only once. On close it will not be
          redisplayed — make sure to share it with the employee now.
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-slate-200 px-5 py-4">
        <Button type="button" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
}

export default CredentialDialog;