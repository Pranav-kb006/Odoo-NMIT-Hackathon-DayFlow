"use client";

import { useRef, useState } from "react";
import { Calendar, AlertCircle, CheckCircle2, Send, AlertTriangle, FileText, X } from "lucide-react";
import { workingDaysBetween } from "@/lib/utils";
import { showToast } from "@/components/ui/Toast";
import { uploadLeaveDocument } from "@/lib/storage";

interface LeaveApplyFormProps {
  onSuccess?: () => void;
}

export function LeaveApplyForm({ onSuccess }: LeaveApplyFormProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute working days count
  const daysCount =
    startDate && endDate && endDate >= startDate
      ? workingDaysBetween(startDate, endDate)
      : 0;

  const isWeekendOnly = Boolean(startDate && endDate && endDate >= startDate && daysCount === 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    if (endDate < startDate) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    if (reason.trim().length < 10) {
      setError("Please provide a reason with at least 10 characters.");
      return;
    }

    if (!file) {
      setFileError("Please attach a supporting document (PDF, JPG, or PNG, max 5MB).");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const upload = await uploadLeaveDocument(file);
      if (!upload.ok) {
        throw new Error(upload.error);
      }

      const res = await fetch("/api/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          reason: reason.trim(),
          attachmentUrl: upload.url,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit leave request");
      }

      setSuccess(true);
      showToast("Leave Request Submitted", `Applied for ${daysCount} working ${daysCount === 1 ? "day" : "days"}.`, "success");
      setStartDate("");
      setEndDate("");
      setReason("");
      setFile(null);
      setFileError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
      showToast("Submission Failed", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Apply for Time Off</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit your leave request for manager approval
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Leave request submitted successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || new Date().toISOString().split("T")[0]}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {startDate && endDate && (
          <div>
            <div className="flex items-center gap-2 rounded-lg bg-blue-50/70 px-3 py-2 text-xs font-medium text-blue-800">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>
                Total Working Days: <strong>{daysCount}</strong> {daysCount === 1 ? "day" : "days"} (Mon–Fri)
              </span>
            </div>
            {isWeekendOnly && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 border border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>The selected date range falls entirely on weekends (0 working days).</span>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Reason / Details
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Please provide the reason for your time off..."
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-[11px] text-slate-400">Minimum 10 characters</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Supporting Document <span className="text-red-600">*</span>
          </label>
          {file ? (
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <FileText className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{file.name}</span>
              <span className="text-[11px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setFileError(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-slate-400 hover:text-red-600"
                aria-label="Remove document"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setFileError(null);
              }}
              required
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
            />
          )}
          {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
          <p className="text-[11px] text-slate-400 mt-1">
            Proof document — PDF, JPG, or PNG, up to 5MB. Required.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
            {loading ? "Submitting Request..." : "Submit Leave Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
