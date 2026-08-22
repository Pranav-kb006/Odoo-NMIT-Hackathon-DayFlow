"use client";

import { useState } from "react";
import { Search, UserCheck, Clock, AlertCircle } from "lucide-react";
import { AttendanceWithProfile } from "@/lib/types";

interface AdminAttendanceTableProps {
  records: AttendanceWithProfile[];
  loading?: boolean;
}

export function AdminAttendanceTable({
  records,
  loading = false,
}: AdminAttendanceTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return "--:--";
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRecords = records.filter((rec) => {
    const name = rec.profiles?.full_name?.toLowerCase() || "";
    const dept = rec.profiles?.department?.toLowerCase() || "";
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) || dept.includes(searchTerm.toLowerCase());

    const isWorking = rec.check_in && !rec.check_out;
    const isCompleted = rec.check_in && rec.check_out;
    const isNotCheckedIn = !rec.check_in;

    if (statusFilter === "working" && !isWorking) return false;
    if (statusFilter === "completed" && !isCompleted) return false;
    if (statusFilter === "not_checked_in" && !isNotCheckedIn) return false;

    return matchesSearch;
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900">Today&apos;s Company Attendance</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking for all employees on {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none w-56 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="working">Currently Working</option>
              <option value="completed">Shift Completed</option>
              <option value="not_checked_in">Not Checked In</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Employee</th>
              <th className="px-6 py-3.5">Department</th>
              <th className="px-6 py-3.5">Check In</th>
              <th className="px-6 py-3.5">Check Out</th>
              <th className="px-6 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  Loading team attendance...
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No attendance records found.
                </td>
              </tr>
            ) : (
              filteredRecords.map((row) => {
                const isWorking = row.check_in && !row.check_out;
                const isCompleted = row.check_in && row.check_out;

                return (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0">
                          {row.profiles?.full_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {row.profiles?.full_name || "Employee"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {row.profiles?.designation || row.profiles?.role || "Staff"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {row.profiles?.department || "General"}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-800">
                      {formatTime(row.check_in)}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-800">
                      {formatTime(row.check_out)}
                    </td>
                    <td className="px-6 py-4">
                      {isWorking ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Working
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          <UserCheck className="h-3 w-3" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                          <Clock className="h-3 w-3" />
                          Not In Yet
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
