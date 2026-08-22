"use client";

import { useState, useMemo, useEffect } from "react";
import {
  calculateSalaryBreakdown,
  type PayrollItem,
  type DBProfile,
} from "@/lib/payroll";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";

interface AdminPayrollManagerProps {
  companyId: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function recentMonths(n = 6) {
  const out: { year: number; month: number; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}` });
  }
  return out;
}

export function AdminPayrollManager({ companyId }: AdminPayrollManagerProps) {
  const months = useMemo(() => recentMonths(6), []);
  const [payrollList, setPayrollList] = useState<PayrollItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState(months[0]);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "processing" | "pending">("all");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Modals
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [detailModalItem, setDetailModalItem] = useState<PayrollItem | null>(null);
  const [editWageItem, setEditWageItem] = useState<PayrollItem | null>(null);
  const [newWageInput, setNewWageInput] = useState("");
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  // Fetch REAL payroll: payslips for the month + latest salary per employee.
  const loadPayroll = async (year: number, month: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payslips?year=${year}&month=${month}`);
      if (!res.ok) throw new Error("Failed to load payroll");
      const data = await res.json();
      const slipMap: Record<string, (typeof data.payslips)[number]> = {};
      for (const p of data.payslips ?? []) slipMap[p.profile_id] = p;
      const emps: DBProfile[] = window.__payrollEmployees ?? [];
      const items: (PayrollItem & { noSalary?: boolean })[] = emps.map((emp) => {
        const slip = slipMap[emp.id];
        const base = data.salaryMap?.[emp.id]?.base ?? 0;
        const bd = calculateSalaryBreakdown(base || 1);
        return {
          id: emp.id,
          empId: `EMP-${emp.id.slice(0, 4).toUpperCase()}`,
          name: emp.full_name,
          role: emp.designation || emp.department || "Employee",
          avatarUrl: emp.avatar_url,
          monthlyWage: slip ? Number(slip.base_salary) : base,
          deductions: slip ? Number(slip.deductions) : bd.totalDeductions * (base > 0 ? 1 : 0),
          netPay: slip ? Number(slip.net_pay) : base > 0 ? bd.netPay : 0,
          status: slip ? "paid" : "pending",
          noSalary: base <= 0 && !slip,
        };
      });
      setPayrollList(items);
    } catch (err) {
      console.error("Payroll load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load the employee roster first, then payroll for the selected month.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/employees");
        if (res.ok) {
          const data = await res.json();
          window.__payrollEmployees = data.employees ?? [];
        }
      } catch {
        /* ignore */
      } finally {
        await loadPayroll(selected.year, selected.month);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // Metrics
  const totalPayroll = useMemo(() => {
    return payrollList.reduce((acc, curr) => acc + curr.netPay, 0);
  }, [payrollList]);

  const paidCount = useMemo(() => {
    return payrollList.filter((item) => item.status === "paid").length;
  }, [payrollList]);

  const pendingCount = useMemo(() => {
    return payrollList.filter((item) => item.status === "pending").length;
  }, [payrollList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return payrollList.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payrollList, searchQuery, statusFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleGenerateAllPayslips = async () => {
    setIsProcessingBatch(true);
    try {
      const res = await fetch("/api/payslips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: selected.year, month: selected.month }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Generation failed");
      }
      await loadPayroll(selected.year, selected.month);
      setBatchModalOpen(false);
    } catch (err: unknown) {
      console.error("Generate failed:", err);
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleUpdateWage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWageItem) return;
    const wage = parseFloat(newWageInput);
    if (isNaN(wage) || wage <= 0) return;

    try {
      const res = await fetch(`/api/employees/${editWageItem.id}/salary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseSalary: wage }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Salary update failed");
      }
      await loadPayroll(selected.year, selected.month);
      setEditWageItem(null);
    } catch (err: unknown) {
      console.error("Wage update failed:", err);
    }
  };

  return (
    <div className="space-y-xl animate-fade-in">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
        <div>
          <h2 className="font-display text-display text-on-background">Payroll Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Manage and process employee salaries directly linked to Directory
          </p>
        </div>

        <div className="flex items-center gap-md w-full md:w-auto">
          {/* Add Employee link */}
          <a
            href="/dashboard/employees"
            className="flex items-center gap-xs px-md py-sm rounded border border-[#E2E8F0] bg-white font-label-md text-label-md text-on-background hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Add Employee</span>
          </a>

          {/* Month Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
              className="flex items-center gap-sm bg-[#FFFFFF] border border-[#E2E8F0] px-md py-sm rounded text-body-md font-body-md text-on-background hover:border-[#CBD5E1] transition-colors focus:outline-none focus:border-[#0F172A]"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>{selected.label}</span>
              <span className="material-symbols-outlined text-[18px] ml-sm">expand_more</span>
            </button>

            {monthDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMonthDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-44 rounded border border-outline-variant bg-surface-container-lowest py-1 shadow-lg z-20">
                  {months.map(
                    (m) => (
                      <button
                        key={m.label}
                        onClick={() => {
                          setSelected(m);
                          setMonthDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          selected.label === m.label
                            ? "bg-surface-container-low font-bold text-primary"
                            : "text-on-surface-variant hover:bg-surface-container-low"
                        }`}
                      >
                        {m.label}
                      </button>
                    )
                  )}
                </div>
              </>
            )}
          </div>

          {/* Generate All Payslips Button */}
          <button
            onClick={() => setBatchModalOpen(true)}
            className="bg-[#0F172A] text-white px-lg py-sm rounded font-label-md text-label-md hover:bg-opacity-90 transition-opacity flex items-center gap-sm whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Generate All Payslips</span>
          </button>
        </div>
      </div>

      {/* ─── Summary Metric Cards Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Total Payroll */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-lg rounded-lg">
          <div className="flex items-center gap-sm mb-md text-on-surface-variant">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <h3 className="font-label-md text-label-md uppercase tracking-wider">Total Payroll</h3>
          </div>
          <p className="font-display text-display text-[#0F172A]">
            {formatCurrency(totalPayroll)}
          </p>
          <div className="mt-sm flex items-center gap-xs text-sm">
            <span className="material-symbols-outlined text-[16px] text-green-600">arrow_upward</span>
            <span className="text-green-600 font-medium">2.4%</span>
            <span className="text-on-surface-variant">vs last month</span>
          </div>
        </div>

        {/* Employees Paid */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-lg rounded-lg">
          <div className="flex items-center gap-sm mb-md text-on-surface-variant">
            <span className="material-symbols-outlined">hevc</span>
            <h3 className="font-label-md text-label-md uppercase tracking-wider">Employees Paid</h3>
          </div>
          <div className="flex items-baseline gap-xs">
            <p className="font-display text-display text-[#0F172A]">{paidCount}</p>
            <p className="font-headline-md text-headline-md text-on-surface-variant">
              / {payrollList.length}
            </p>
          </div>
          <div className="w-full bg-surface-container mt-md h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#0F172A] h-full rounded-full transition-all duration-500"
              style={{
                width: `${payrollList.length > 0 ? (paidCount / payrollList.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-lg rounded-lg">
          <div className="flex items-center gap-sm mb-md text-on-surface-variant">
            <span className="material-symbols-outlined">pending_actions</span>
            <h3 className="font-label-md text-label-md uppercase tracking-wider">Pending Approval</h3>
          </div>
          <p className="font-display text-display text-[#0F172A]">{pendingCount}</p>
          <div className="mt-sm">
            <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-50 text-yellow-700 font-label-md text-[10px] uppercase border border-yellow-200">
              {pendingCount > 0 ? "Requires Action" : "All Caught Up"}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Employee List Section & Table ─── */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-md border-b border-[#F1F5F9] flex flex-col sm:flex-row justify-between items-center gap-md">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employees by name or ID..."
              className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded focus:border-[#0F172A] focus:ring-0 font-body-md text-body-md placeholder:text-on-surface-variant transition-colors"
            />
          </div>

          {/* Filter & Refresh */}
          <div className="flex items-center gap-sm w-full sm:w-auto">
            <button
              onClick={() => loadPayroll(selected.year, selected.month)}
              className="flex items-center gap-xs px-md py-2 border border-[#E2E8F0] rounded hover:bg-[#F8FAFB] transition-colors font-label-md text-label-md text-[#0F172A]"
              title="Refresh from Directory"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Sync Directory</span>
            </button>

            <div className="relative flex-1 sm:flex-none">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="flex items-center gap-sm px-md py-2 border border-[#E2E8F0] rounded hover:bg-[#F8FAFB] transition-colors font-label-md text-label-md text-[#0F172A] whitespace-nowrap w-full justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                <span>Filter: {statusFilter.toUpperCase()}</span>
              </button>

              {filterDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setFilterDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-40 rounded border border-outline-variant bg-surface-container-lowest py-1 shadow-lg z-20">
                    {(["all", "paid", "processing", "pending"] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setStatusFilter(st);
                          setFilterDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs uppercase font-medium transition-colors ${
                          statusFilter === st
                            ? "bg-surface-container-low text-primary font-bold"
                            : "text-on-surface-variant hover:bg-surface-container-low"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#F8FAFB] border-b border-[#F1F5F9]">
                <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-medium">
                  Employee Name
                </th>
                <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-medium">
                  Employee ID
                </th>
                <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-medium text-right">
                  Salary (Monthly)
                </th>
                <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-medium text-right">
                  Deductions
                </th>
                <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-medium text-right">
                  Net Pay
                </th>
                <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-medium text-center">
                  Status
                </th>
                <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-medium text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-xl text-center text-on-surface-variant">
                    Loading payroll records from Directory...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-xl text-center text-on-surface-variant">
                    No employees found in Directory matching your search.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#F8FAFB]/50 transition-colors ${
                      item.status === "pending" ? "bg-yellow-50/30" : ""
                    }`}
                  >
                    <td className="py-sm px-lg">
                      <div className="flex items-center gap-md">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant flex-shrink-0 flex items-center justify-center text-on-surface-variant font-medium text-xs">
                          {item.avatarUrl ? (
                            <img
                              src={item.avatarUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            item.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          )}
                        </div>
                        <div>
                          <p className="font-body-md text-body-md font-medium text-[#0F172A]">
                            {item.name}
                          </p>
                          <p className="font-body-sm text-[12px] text-on-surface-variant">
                            {item.role}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-sm px-lg font-mono-sm text-mono-sm text-on-surface-variant">
                      {item.empId}
                    </td>
                    <td className="py-sm px-lg font-mono-sm text-mono-sm text-[#0F172A] text-right">
                      <div className="flex items-center justify-end gap-1">
                        {item.noSalary ? (
                          <span className="text-amber-600 text-xs">Set salary</span>
                        ) : (
                          <span>{formatCurrency(item.monthlyWage)}</span>
                        )}
                        <button
                          onClick={() => {
                            setEditWageItem(item);
                            setNewWageInput((item.monthlyWage || 0).toString());
                          }}
                          className="text-on-surface-variant hover:text-primary p-0.5 rounded transition-colors"
                          title="Edit Base Wage"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                      </div>
                    </td>
                    <td className="py-sm px-lg font-mono-sm text-mono-sm text-error text-right">
                      -{formatCurrency(item.deductions)}
                    </td>
                    <td className="py-sm px-lg font-mono-sm text-mono-sm font-medium text-[#0F172A] text-right">
                      {formatCurrency(item.netPay)}
                    </td>
                    <td className="py-sm px-lg text-center">
                      {item.status === "paid" && (
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-green-50 text-green-700 font-label-md text-[11px] border border-green-200 min-w-[80px]">
                          Paid
                        </span>
                      )}
                      {item.status === "processing" && (
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-blue-50 text-blue-700 font-label-md text-[11px] border border-blue-200 min-w-[80px]">
                          Processing
                        </span>
                      )}
                      {item.status === "pending" && (
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-yellow-50 text-yellow-700 font-label-md text-[11px] border border-yellow-200 min-w-[80px]">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-sm px-lg text-right">
                      <button
                        onClick={() => setDetailModalItem(item)}
                        className="text-[#0F172A] hover:text-primary-container p-1 rounded hover:bg-[#F8FAFB] transition-colors"
                        title={item.status === "paid" ? "Download Payslip" : "Review Breakdown"}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {item.status === "paid"
                            ? "download"
                            : item.status === "processing"
                            ? "visibility"
                            : "edit_document"}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-md border-t border-[#F1F5F9] flex justify-between items-center text-sm text-on-surface-variant font-body-md">
          <span>Showing 1 to {filteredList.length} of {payrollList.length} entries</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 border border-[#E2E8F0] rounded hover:bg-[#F8FAFB] disabled:opacity-50" disabled>
              Prev
            </button>
            <button className="px-3 py-1 bg-[#0F172A] text-white rounded">1</button>
            <button className="px-2 py-1 border border-[#E2E8F0] rounded hover:bg-[#F8FAFB]" disabled>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ─── MODAL 1: Generate All Payslips Confirmation ─── */}
      <Modal open={batchModalOpen} onClose={() => setBatchModalOpen(false)}>
        <ModalHeader
          title="Batch Process Payslips"
          description={`Generate and finalize payslips for ${selected.label}`}
          onClose={() => setBatchModalOpen(false)}
        />
        <ModalBody className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            You are about to generate payslips for all eligible employees for{" "}
            <strong>{selected.label}</strong>.
          </p>
          <div className="rounded-lg bg-surface-container-low p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary">Total Employees:</span>
              <span className="font-bold text-on-surface">{payrollList.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Currently Pending/Processing:</span>
              <span className="font-bold text-amber-600">
                {payrollList.length - paidCount}
              </span>
            </div>
            <div className="flex justify-between border-t border-outline-variant/30 pt-2">
              <span className="text-secondary">Estimated Total Net Payout:</span>
              <span className="font-bold text-primary">
                {formatCurrency(totalPayroll)}
              </span>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            onClick={() => setBatchModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateAllPayslips}
            disabled={isProcessingBatch}
            className="px-5 py-2 text-sm font-medium bg-[#0F172A] text-white rounded hover:bg-opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-60"
          >
            {isProcessingBatch ? (
              <>Processing Batch...</>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                Confirm & Issue Payslips
              </>
            )}
          </button>
        </ModalFooter>
      </Modal>

      {/* ─── MODAL 2: Salary Breakdown Details (PRD §5.6 Formula Inspector) ─── */}
      {detailModalItem && (
        <Modal open={!!detailModalItem} onClose={() => setDetailModalItem(null)}>
          <ModalHeader
            title={`${detailModalItem.name} — Payslip Breakdown`}
            description={`${detailModalItem.empId} · ${detailModalItem.role}`}
            onClose={() => setDetailModalItem(null)}
          />
          <ModalBody className="space-y-4">
            {(() => {
              const bd = calculateSalaryBreakdown(detailModalItem.monthlyWage);
              return (
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-surface-container-high p-3 rounded-lg">
                    <span className="font-bold text-sm text-primary">Gross Monthly Wage</span>
                    <span className="font-mono-sm font-bold text-base text-primary">
                      {formatCurrency(bd.monthlyWage)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-on-surface">
                    <p className="font-bold uppercase text-[10px] tracking-wider text-secondary">
                      Earnings Breakdown
                    </p>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Basic Salary (50%)</span>
                      <span className="font-mono-sm">{formatCurrency(bd.basic)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>House Rent Allowance (HRA 50% of Basic)</span>
                      <span className="font-mono-sm">{formatCurrency(bd.hra)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Standard Allowance (Flat)</span>
                      <span className="font-mono-sm">{formatCurrency(bd.standardAllowance)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Performance Bonus (8.33%)</span>
                      <span className="font-mono-sm">{formatCurrency(bd.performanceBonus)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Leave Travel Allowance (LTA 8.33%)</span>
                      <span className="font-mono-sm">{formatCurrency(bd.lta)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Fixed Allowance (Balance)</span>
                      <span className="font-mono-sm">{formatCurrency(bd.fixedAllowance)}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-on-surface pt-2">
                    <p className="font-bold uppercase text-[10px] tracking-wider text-secondary">
                      Deductions (Est.)
                    </p>
                    <div className="flex justify-between py-1 border-b border-slate-100 text-error">
                      <span>Employee Provident Fund (PF 12%)</span>
                      <span className="font-mono-sm">-{formatCurrency(bd.employeePf)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 text-error">
                      <span>Professional Tax (Flat)</span>
                      <span className="font-mono-sm">-{formatCurrency(bd.professionalTax)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-green-50 border border-green-200 p-3 rounded-lg text-green-900 mt-3">
                    <span className="font-bold text-sm">Net Payable Salary</span>
                    <span className="font-mono-sm font-bold text-lg text-green-700">
                      {formatCurrency(bd.netPay)}
                    </span>
                  </div>
                </div>
              );
            })()}
          </ModalBody>
          <ModalFooter>
            <button
              onClick={() => setDetailModalItem(null)}
              className="px-5 py-2 text-sm font-medium bg-[#0F172A] text-white rounded hover:bg-opacity-90 transition-opacity"
            >
              Close
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* ─── MODAL 3: Edit Employee Base Wage ─── */}
      {editWageItem && (
        <Modal open={!!editWageItem} onClose={() => setEditWageItem(null)}>
          <ModalHeader
            title={`Edit Base Salary — ${editWageItem.name}`}
            description={`${editWageItem.empId} · ${editWageItem.role}`}
            onClose={() => setEditWageItem(null)}
          />
          <form onSubmit={handleUpdateWage}>
            <ModalBody className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-secondary mb-1">
                  Monthly Wage (Gross USD / ₹)
                </label>
                <input
                  type="number"
                  step="100"
                  min="500"
                  required
                  value={newWageInput}
                  onChange={(e) => setNewWageInput(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded focus:border-[#0F172A] focus:ring-0 text-sm"
                />
              </div>
              <p className="text-xs text-on-surface-variant">
                Updating the monthly wage will automatically recalculate Basic (50%), HRA, Allowances, PF, Professional Tax, and Net Pay according to PRD §5.6.
              </p>
            </ModalBody>
            <ModalFooter>
              <button
                type="button"
                onClick={() => setEditWageItem(null)}
                className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium bg-[#0F172A] text-white rounded hover:bg-opacity-90 transition-opacity"
              >
                Update Salary
              </button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </div>
  );
}
