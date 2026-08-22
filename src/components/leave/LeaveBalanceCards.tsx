"use client";

import { Umbrella, HeartPulse, Clock, Sparkles } from "lucide-react";

interface LeaveBalanceCardsProps {
  paidAvailable?: number;
  sickAvailable?: number;
  totalTaken?: number;
  pendingCount?: number;
}

export function LeaveBalanceCards({
  paidAvailable = 12,
  sickAvailable = 7,
  totalTaken = 0,
  pendingCount = 0,
}: LeaveBalanceCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <Umbrella className="h-4 w-4 text-blue-500" />
          <span>Paid Leave</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900">{paidAvailable} <span className="text-sm font-normal text-slate-500">days</span></p>
        <span className="text-xs text-emerald-600 font-medium">Available balance</span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <HeartPulse className="h-4 w-4 text-rose-500" />
          <span>Sick Leave</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900">{sickAvailable} <span className="text-sm font-normal text-slate-500">days</span></p>
        <span className="text-xs text-emerald-600 font-medium">Available balance</span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span>Days Used</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900">{totalTaken} <span className="text-sm font-normal text-slate-500">days</span></p>
        <span className="text-xs text-slate-400">Approved this year</span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <Clock className="h-4 w-4 text-amber-500" />
          <span>Pending</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900">{pendingCount} <span className="text-sm font-normal text-slate-500">requests</span></p>
        <span className="text-xs text-amber-600 font-medium">Awaiting review</span>
      </div>
    </div>
  );
}
