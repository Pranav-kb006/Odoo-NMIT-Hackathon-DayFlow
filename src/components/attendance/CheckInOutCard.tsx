"use client";

import { useEffect, useState } from "react";
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { AttendanceRow } from "@/lib/types";

interface CheckInOutCardProps {
  initialAttendance?: AttendanceRow | null;
  onStatusChange?: (updated: AttendanceRow) => void;
}

export function CheckInOutCard({
  initialAttendance,
  onStatusChange,
}: CheckInOutCardProps) {
  const [attendance, setAttendance] = useState<AttendanceRow | null>(
    initialAttendance ?? null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (initialAttendance !== undefined) {
      setAttendance(initialAttendance);
    }
  }, [initialAttendance]);

  const isCheckedIn = Boolean(attendance?.check_in);
  const isCheckedOut = Boolean(attendance?.check_out);
  const isActiveShift = isCheckedIn && !isCheckedOut;

  // Live timer effect
  useEffect(() => {
    if (!isActiveShift || !attendance?.check_in) {
      if (isCheckedIn && isCheckedOut && attendance?.check_in && attendance.check_out) {
        const start = new Date(attendance.check_in).getTime();
        const end = new Date(attendance.check_out).getTime();
        setElapsedSeconds(Math.max(0, Math.floor((end - start) / 1000)));
      } else {
        setElapsedSeconds(0);
      }
      return;
    }

    const checkInTime = new Date(attendance.check_in).getTime();

    const updateTimer = () => {
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - checkInTime) / 1000)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isActiveShift, attendance?.check_in, attendance?.check_out, isCheckedIn, isCheckedOut]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return "--:--";
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/attendance/checkin", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to check in");
      setAttendance(data.attendance);
      onStatusChange?.(data.attendance);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error checking in");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/attendance/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to check out");
      setAttendance(data.attendance);
      onStatusChange?.(data.attendance);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error checking out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Today&apos;s Attendance</h2>
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div>
          {isActiveShift ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Working
            </span>
          ) : isCheckedOut ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />
              Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Not Checked In
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="my-6 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-1">
          <Clock className="h-4 w-4" />
          <span>Logged Time</span>
        </div>
        <div className="font-mono text-4xl font-bold tracking-tight text-slate-900">
          {formatTimer(elapsedSeconds)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 text-center">
        <div>
          <span className="text-xs font-medium text-slate-500">Check In</span>
          <p className="mt-1 text-base font-semibold text-slate-800">
            {formatTime(attendance?.check_in)}
          </p>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-500">Check Out</span>
          <p className="mt-1 text-base font-semibold text-slate-800">
            {formatTime(attendance?.check_out)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        {!isCheckedIn ? (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Checking In..." : "Check In"}
          </button>
        ) : !isCheckedOut ? (
          <button
            onClick={handleCheckOut}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {loading ? "Checking Out..." : "Check Out"}
          </button>
        ) : (
          <div className="flex-1 rounded-lg bg-slate-100 py-2.5 text-center text-sm font-medium text-slate-600">
            Attendance recorded for today
          </div>
        )}
      </div>
    </div>
  );
}
