"use client";

import { useEffect, useState, useCallback } from "react";
import { LeaveApplyForm } from "@/components/leave/LeaveApplyForm";
import { MyLeavesList } from "@/components/leave/MyLeavesList";
import { TeamLeaveQueue } from "@/components/leave/TeamLeaveQueue";
import { LeaveRequest, LeaveRequestWithProfile, Role } from "@/lib/types";
import { RefreshCw, Users, User } from "lucide-react";

export default function LeavePage() {
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [teamRequests, setTeamRequests] = useState<LeaveRequestWithProfile[]>([]);
  const [userRole, setUserRole] = useState<Role>("employee");
  const [activeTab, setActiveTab] = useState<"my_leaves" | "team_queue">("my_leaves");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaveData = useCallback(async () => {
    try {
      setRefreshing(true);
      // 1. Fetch user's own requests
      const res = await fetch("/api/leave-requests");
      if (res.ok) {
        const data = await res.json();
        setMyRequests(data.leaveRequests || []);
      }

      // 2. Try fetch company queue if admin
      const adminRes = await fetch("/api/leave-requests?scope=company");
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        if (adminData.leaveRequests) {
          setTeamRequests(adminData.leaveRequests);
          setUserRole("admin");
        }
      }
    } catch (err) {
      console.error("Failed to fetch leave data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaveData();
  }, [fetchLeaveData]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Time Off & Leave</h1>
          <p className="text-sm text-slate-500 mt-1">
            Apply for leave, track application status, and manage team approvals
          </p>
        </div>

        <div className="flex items-center gap-3">
          {userRole === "admin" && (
            <div className="flex items-center bg-slate-200/70 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("my_leaves")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "my_leaves"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                My Leaves
              </button>
              <button
                onClick={() => setActiveTab("team_queue")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "team_queue"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Team Approvals
                {teamRequests.filter((r) => r.status === "pending").length > 0 && (
                  <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.2 text-[10px] text-white">
                    {teamRequests.filter((r) => r.status === "pending").length}
                  </span>
                )}
              </button>
            </div>
          )}

          <button
            onClick={() => fetchLeaveData()}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none shadow-sm disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {activeTab === "team_queue" && userRole === "admin" ? (
        <TeamLeaveQueue
          requests={teamRequests}
          loading={loading}
          onReviewed={() => fetchLeaveData()}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <LeaveApplyForm onSuccess={() => fetchLeaveData()} />
          </div>
          <div className="lg:col-span-2">
            <MyLeavesList requests={myRequests} loading={loading} />
          </div>
        </div>
      )}
    </div>
  );
}
