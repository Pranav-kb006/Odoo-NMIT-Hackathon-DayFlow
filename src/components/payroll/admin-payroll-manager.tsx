"use client";

import { useState, useMemo } from "react";
import { calculateSalaryBreakdown, type PayrollItem } from "@/lib/payroll";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";

const INITIAL_PAYROLL_DATA: PayrollItem[] = [
  {
    id: "1",
    name: "Sarah Jenkins",
    role: "Senior Engineer",
    empId: "EMP-0492",
    monthlyWage: 8500,
    deductions: 1250,
    netPay: 7250,
    status: "paid",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    name: "Marcus Thorne",
    role: "Product Manager",
    empId: "EMP-0184",
    monthlyWage: 9200,
    deductions: 1400,
    netPay: 7800,
    status: "paid",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    name: "Alicia Lin",
    role: "UX Designer",
    empId: "EMP-0511",
    monthlyWage: 7800,
    deductions: 1100,
    netPay: 6700,
    status: "processing",
    avatarUrl: null,
  },
  {
    id: "4",
    name: "David Chen",
    role: "Marketing Lead",
    empId: "EMP-0329",
    monthlyWage: 8100,
    deductions: 1150,
    netPay: 6950,
    status: "pending",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "5",
    name: "Elena Silva",
    role: "Backend Developer",
    empId: "EMP-0612",
    monthlyWage: 8800,
    deductions: 1300,
    netPay: 7500,
    status: "paid",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "6",
    name: "Alex Mercer",
    role: "Full Stack Engineer",
    empId: "EMP-0243",
    monthlyWage: 9500,
    deductions: 1450,
    netPay: 8050,
    status: "pending",
    avatarUrl: null,
  },
];

export function AdminPayrollManager() {
  const [payrollList, setPayrollList] = useState<PayrollItem[]>(INITIAL_PAYROLL_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("October 2023");
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "processing" | "pending">("all");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Modals
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [detailModalItem, setDetailModalItem] = useState<PayrollItem | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

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

  const handleGenerateAllPayslips = () => {
    setIsProcessingBatch(true);
    setTimeout(() => {
      setPayrollList((prev) =>
        prev.map((item) => ({ ...item, status: "paid" }))
      );
      setIsProcessingBatch(false);
      setBatchModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-xl animate-fade-in">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
        <div>
          <h2 className="font-display text-display text-on-background">Payroll Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Manage and process employee salaries
          </p>
        </div>

        <div className="flex items-center gap-md w-full md:w-auto">
          {/* Month Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
              className="flex items-center gap-sm bg-[#FFFFFF] border border-[#E2E8F0] px-md py-sm rounded text-body-md font-body-md text-on-background hover:border-[#CBD5E1] transition-colors focus:outline-none focus:border-[#0F172A]"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>{selectedMonth}</span>
              <span className="material-symbols-outlined text-[18px] ml-sm">expand_more</span>
            </button>

            {monthDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMonthDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-44 rounded border border-outline-variant bg-surface-container-lowest py-1 shadow-lg z-20">
                  {["September 2023", "October 2023", "November 2023", "December 2023"].map(
                    (m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setSelectedMonth(m);
                          setMonthDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          selectedMonth === m
                            ? "bg-surface-container-low font-bold text-primary"
                            : "text-on-surface-variant hover:bg-surface-container-low"
                        }`}
                      >
                        {m}
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

      {/* ─── Summary Metric Cards Grid (3 cards matching UI design) ─── */}
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
              style={{ width: `${(paidCount / payrollList.length) * 100}%` }}
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

          {/* Filter Dropdown */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className="flex items-center gap-sm px-md py-2 border border-[#E2E8F0] rounded hover:bg-[#F8FAFB] transition-colors font-label-md text-label-md text-[#0F172A] whitespace-nowrap w-full sm:w-auto justify-center"
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
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-xl text-center text-on-surface-variant">
                    No payroll records found matching your search.
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
                      {formatCurrency(item.monthlyWage)}
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
          description={`Generate and finalize payslips for ${selectedMonth}`}
          onClose={() => setBatchModalOpen(false)}
        />
        <ModalBody className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            You are about to generate payslips for all eligible employees for{" "}
            <strong>{selectedMonth}</strong>.
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
    </div>
  );
}
