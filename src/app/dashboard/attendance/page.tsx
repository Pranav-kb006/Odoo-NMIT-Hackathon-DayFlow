"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckInOutCard } from "@/components/attendance/CheckInOutCard";
import { TodayStatusCard } from "@/components/attendance/TodayStatusCard";
import { AttendanceHistoryTable } from "@/components/attendance/AttendanceHistoryTable";
import { AdminAttendanceTable } from "@/components/attendance/AdminAttendanceTable";
import { AttendanceRow, AttendanceWithProfile, Role } from "@/lib/types";
import { Users, User, RefreshCw } from "lucide-react";

export default function AttendancePage() {
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRow | null>(null);
  const [history, setHistory] = useState<AttendanceWithProfile[]>([]);
  const [stats, setStats] = useState({
    presentDays: 0,
    totalHours: 0,
    avgHoursPerDay: 0,
  });
  const [teamToday, setTeamToday] = useState<AttendanceWithProfile[]>([]);
  const [userRole, setUserRole] = useState<Role>("employee");
  const [viewMode, setViewMode] = useState<"self" | "team">("self");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAttendanceData = useCallback(async () => {
    try {
      setRefreshing(true);
      // 1. Fetch today's status
      const todayRes = await fetch("/api/attendance/today");
      if (todayRes.ok) {
        const todayData = await todayRes.json();
        setTodayAttendance(todayData.attendance);
      }

      // 2. Fetch history
      const historyRes = await fetch("/api/attendance/history");
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData.records || []);
        if (historyData.stats) {
          setStats(historyData.stats);
        }
      }

      // 3. Try fetch admin team data
      const teamRes = await fetch("/api/attendance/today?scope=company");
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        if (teamData.attendance) {
          setTeamToday(teamData.attendance);
          setUserRole("admin");
        }
      }
    } catch (error) {
      console.error("Failed to load attendance data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track daily work hours, check-ins, and monthly activity
          </p>
        </div>

        <div className="flex items-center gap-3">
          {userRole === "admin" && (
            <div className="flex items-center bg-slate-200/70 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("self")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  viewMode === "self"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                My Attendance
              </button>
              <button
                onClick={() => setViewMode("team")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  viewMode === "team"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Company Today
              </button>
            </div>
          )}

          <button
            onClick={() => fetchAttendanceData()}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none shadow-sm disabled:opacity-50"
            title="Refresh attendance"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {viewMode === "team" && userRole === "admin" ? (
        <AdminAttendanceTable records={teamToday} loading={loading} />
      ) : (
        <>
          {/* Top Section: Check-in/out card + Monthly metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <CheckInOutCard
                initialAttendance={todayAttendance}
                onStatusChange={() => fetchAttendanceData()}
              />
            </div>
            <div className="lg:col-span-2 flex flex-col justify-between gap-4">
              <TodayStatusCard
                presentDays={stats.presentDays}
                totalHours={stats.totalHours}
                avgHours={stats.avgHoursPerDay}
              />
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
                <h4 className="text-sm font-semibold text-blue-900">Work Hours Policy</h4>
                <p className="text-xs text-blue-700/90 mt-1 leading-relaxed">
                  Standard shifts are 8 hours/day (Mon–Fri). Remember to check in when you start your day and check out when completing your shift to ensure accurate time tracking and payroll computation.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section: History Table */}
          <AttendanceHistoryTable records={history} loading={loading} />
        </>
      )}
    </div>
  );
}
