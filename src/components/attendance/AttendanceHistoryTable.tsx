"use client";

import { AttendanceWithProfile } from "@/lib/types";

interface AttendanceHistoryTableProps {
  records: AttendanceWithProfile[];
  loading?: boolean;
}

export function AttendanceHistoryTable({
  records,
  loading = false,
}: AttendanceHistoryTableProps) {
  const formatTime = (isoString?: string | null) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString + "T00:00:00");
    return {
      date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
    };
  };

  const formatDuration = (minutes?: number | null) => {
    if (minutes === null || minutes === undefined) return "-";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="font-semibold text-slate-900">Attendance Log</h3>
        <p className="text-xs text-slate-500 mt-0.5">Recent daily attendance records</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Date</th>
              <th className="px-6 py-3.5">Check In</th>
              <th className="px-6 py-3.5">Check Out</th>
              <th className="px-6 py-3.5">Duration</th>
              <th className="px-6 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  Loading attendance records...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No attendance records found for this period.
                </td>
              </tr>
            ) : (
              records.map((row) => {
                const { date, day } = formatDate(row.work_date);
                const isComplete = Boolean(row.check_in && row.check_out);
                const isInProgress = Boolean(row.check_in && !row.check_out);

                return (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{date}</div>
                      <div className="text-xs text-slate-400">{day}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-800">
                      {formatTime(row.check_in)}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-800">
                      {formatTime(row.check_out)}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {formatDuration(row.duration_minutes)}
                    </td>
                    <td className="px-6 py-4">
                      {isInProgress ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          In Progress
                        </span>
                      ) : isComplete ? (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          Pending
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
