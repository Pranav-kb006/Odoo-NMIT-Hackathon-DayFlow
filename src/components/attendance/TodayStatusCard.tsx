"use client";

import { Calendar, Clock, CheckCircle, TrendingUp } from "lucide-react";

interface TodayStatusCardProps {
  presentDays?: number;
  totalHours?: number;
  avgHours?: number;
  leavesTaken?: number;
}

export function TodayStatusCard({
  presentDays = 0,
  totalHours = 0,
  avgHours = 0,
  leavesTaken = 0,
}: TodayStatusCardProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>Days Present</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900">{presentDays}</p>
        <span className="text-xs text-slate-400">This month</span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <Clock className="h-4 w-4 text-blue-500" />
          <span>Total Hours</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900">{totalHours}h</p>
        <span className="text-xs text-slate-400">Logged work</span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <TrendingUp className="h-4 w-4 text-indigo-500" />
          <span>Avg Hours / Day</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900">{avgHours}h</p>
        <span className="text-xs text-slate-400">Per present day</span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <Calendar className="h-4 w-4 text-amber-500" />
          <span>Leaves Taken</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900">{leavesTaken}</p>
        <span className="text-xs text-slate-400">Approved leaves</span>
      </div>
    </div>
  );
}
