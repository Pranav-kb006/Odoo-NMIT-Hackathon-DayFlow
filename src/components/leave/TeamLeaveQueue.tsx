"use client";

import { useState } from "react";
import { LeaveRequestWithProfile } from "@/lib/types";
import { workingDaysBetween } from "@/lib/utils";
import { Check, X, Calendar, Clock, AlertCircle, FileText } from "lucide-react";
import { showToast } from "@/components/ui/Toast";

interface TeamLeaveQueueProps {
  requests: LeaveRequestWithProfile[];
  loading?: boolean;
  onReviewed?: () => void;
}

export function TeamLeaveQueue({
  requests,
  loading = false,
  onReviewed,
}: TeamLeaveQueueProps) {
  const [filter, setFilter] = useState<string>("pending");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true;
    return req.status === filter;
  });

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    setActionLoadingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/leave-requests/${id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update review status");
      }
      showToast(
        status === "approved" ? "Leave Request Approved" : "Leave Request Rejected",
        `Updated request status to ${status}.`,
        status === "approved" ? "success" : "info"
      );
      onReviewed?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error processing review";
      setError(msg);
      showToast("Review Action Failed", msg, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start + "T00:00:00").toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    const e = new Date(end + "T00:00:00").toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${s} – ${e}`;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900">Leave Approval Requests</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and take action on employee time-off requests
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                filter === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab === "pending" ? "Pending Review" : tab}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Employee</th>
              <th className="px-6 py-3.5">Duration</th>
              <th className="px-6 py-3.5">Days</th>
              <th className="px-6 py-3.5">Reason</th>
              <th className="px-6 py-3.5">Attachment</th>
              <th className="px-6 py-3.5">Applied On</th>
              <th className="px-6 py-3.5 text-right">Action / Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Loading leave queue...
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No {filter !== "all" ? filter : ""} leave requests found.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => {
                const days = workingDaysBetween(req.start_date, req.end_date);
                const isPending = req.status === "pending";
                const isBusy = actionLoadingId === req.id;

                return (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0">
                          {req.profiles?.full_name?.charAt(0) || "E"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {req.profiles?.full_name || "Employee"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {req.profiles?.department || "General"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatDateRange(req.start_date, req.end_date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {days} {days === 1 ? "day" : "days"}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-600" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="px-6 py-4">
                      {req.attachment_url ? (
                        <a
                          href={req.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(req.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isPending ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleReview(req.id, "approved")}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(req.id, "rejected")}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                            req.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {req.status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
