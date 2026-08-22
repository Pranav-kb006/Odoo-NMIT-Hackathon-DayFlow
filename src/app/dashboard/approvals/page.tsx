import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { reviewLeaveAction } from "@/app/actions/leave-review";

export const metadata = { title: "Approvals — Dayflow" };

type LeaveWithEmployee = {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  profiles: { full_name: string } | null;
};

export default async function ApprovalsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard");

  const db = createClient();
  const { data: requests } = await db
    .from("leave_requests")
    .select("id, start_date, end_date, reason, status, created_at, profiles(full_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const leaves = (requests ?? []) as unknown as LeaveWithEmployee[];

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Approvals</h1>
        <p className="text-sm text-slate-500">Leave requests waiting on you.</p>
      </div>

      {leaves.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">Nothing pending. You&apos;re all caught up.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {leaves.map((l) => (
            <li
              key={l.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800">
                    {l.profiles?.full_name ?? "Unknown"}
                  </span>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {l.start_date} → {l.end_date}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{l.reason}</p>
              </div>

              <div className="flex shrink-0 gap-2">
                <form action={reviewLeaveAction}>
                  <input type="hidden" name="id" value={l.id} />
                  <button
                    type="submit"
                    name="action"
                    value="approved"
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
                  >
                    Approve
                  </button>
                </form>
                <form action={reviewLeaveAction}>
                  <input type="hidden" name="id" value={l.id} />
                  <button
                    type="submit"
                    name="action"
                    value="rejected"
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}