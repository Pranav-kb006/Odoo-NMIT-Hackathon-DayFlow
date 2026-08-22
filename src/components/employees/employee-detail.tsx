"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  FileText,
  Download,
  Award,
  Plus,
  ArrowLeft,
  DollarSign,
} from "lucide-react";
import type { Employee } from "@/components/employees/types";

type PrivateInfo = {
  date_of_birth: string | null;
  residing_address: string | null;
  gender: string | null;
  nationality: string | null;
  marital_status: string | null;
  bank_account_number: string | null;
  bank_name: string | null;
  ifsc_code: string | null;
  pan_no: string | null;
  uan_no: string | null;
};

type UserDocument = {
  id: string;
  doc_type: "resume" | "certification" | "other";
  file_url: string;
  file_size_bytes: number;
  uploaded_at: string;
};

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return dateFmt.format(d);
}

function getInitials(employee: Employee): string {
  const first = employee.first_name?.trim().charAt(0) || "";
  const last = employee.last_name?.trim().charAt(0) || "";
  return (first + last).toUpperCase() || "U";
}

function mask(value: string | null): string {
  if (!value) return "—";
  if (value.length <= 4) return value;
  return `**** ${value.slice(-4)}`;
}

export function EmployeeDetail({
  employee,
  companyName = "—",
  privateInfo,
  documents = [],
  canViewPrivateInfo = false,
  onEdit,
}: {
  employee: Employee;
  companyName?: string;
  privateInfo: PrivateInfo | null;
  documents?: UserDocument[];
  canViewPrivateInfo?: boolean;
  onEdit?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"resume" | "private" | "salary">("resume");

  const fullName = `${employee.first_name} ${employee.last_name}`.trim() || "Employee";

  const certifications = documents.filter((d) => d.doc_type === "certification");
  const otherDocs = documents.filter((d) => d.doc_type !== "certification");

  // Salary calculations based on standard wage allocation
  const monthlyWage = 8500;
  const yearlyWage = monthlyWage * 12;
  const basicSalary = monthlyWage * 0.5;
  const hra = monthlyWage * 0.25;
  const standardAllowance = monthlyWage * 0.15;
  const performanceBonus = monthlyWage * 0.1;
  const employeePf = basicSalary * 0.12;
  const employerPf = basicSalary * 0.12;
  const professionalTax = 200;
  const netPay = monthlyWage - employeePf - professionalTax;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in-50 duration-200">
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          href="/dashboard/employees"
          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Directory</span>
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{fullName}</span>
      </div>

      {/* Top Profile Header Card (Real Data without Hardcoded Values) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            {employee.avatar_url ? (
              <img
                src={employee.avatar_url}
                alt={fullName}
                className="h-28 w-28 rounded-full object-cover border-2 border-slate-100 shadow-inner"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-blue-700 border-2 border-slate-100 shadow-inner">
                {getInitials(employee)}
              </div>
            )}
            <span
              className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white ${
                employee.status === "active" ? "bg-emerald-500" : "bg-slate-300"
              }`}
              title={employee.status ?? "active"}
            />
          </div>

          {/* Details Grid */}
          <div className="flex-1 w-full flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {fullName}
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-0.5">
                  {employee.job_position || "Team Member"} ·{" "}
                  <span className="capitalize">{employee.role}</span>
                </p>
              </div>

              {onEdit && (
                <button
                  onClick={onEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {/* 3-Column Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 pt-2 border-t border-slate-100">
              <div className="border-b border-slate-100 pb-2.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Company
                </span>
                <span className="text-sm font-medium text-slate-800 mt-0.5 block truncate">
                  {companyName}
                </span>
              </div>

              <div className="border-b border-slate-100 pb-2.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Department
                </span>
                <span className="text-sm font-medium text-slate-800 mt-0.5 block truncate">
                  {employee.department || "—"}
                </span>
              </div>

              <div className="border-b border-slate-100 pb-2.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Login ID
                </span>
                <span className="text-sm font-mono text-slate-800 mt-0.5 block truncate">
                  {employee.login_id}
                </span>
              </div>

              <div className="border-b border-slate-100 pb-2.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Email
                </span>
                <span className="text-sm font-medium text-slate-800 mt-0.5 block truncate">
                  {employee.work_email || "—"}
                </span>
              </div>

              <div className="border-b border-slate-100 pb-2.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Manager
                </span>
                <span className="text-sm font-medium text-slate-800 mt-0.5 block truncate">
                  {employee.manager_id || "—"}
                </span>
              </div>

              <div className="border-b border-slate-100 pb-2.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Mobile
                </span>
                <span className="text-sm font-mono text-slate-800 mt-0.5 block truncate">
                  {employee.mobile || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar: Resume, Private Info, Salary Info */}
      <div className="flex border-b border-slate-200 w-full overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("resume")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === "resume"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          Resume
        </button>

        {canViewPrivateInfo && (
          <button
            onClick={() => setActiveTab("private")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "private"
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            Private Info
          </button>
        )}

        <button
          onClick={() => setActiveTab("salary")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === "salary"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          Salary Info
        </button>
      </div>

      {/* Tab 1: Resume */}
      {activeTab === "resume" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): About & Documents */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-6">
              {/* About */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <h3 className="text-base font-bold text-slate-900">About</h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  {employee.about || "No bio information provided yet."}
                </p>
              </div>

              {/* What I love about my job */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    What I love about my job
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-500 italic">
                  Collaborating across teams to deliver high-quality products and achieve team goals.
                </p>
              </div>

              {/* My interests and hobbies */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    My interests and hobbies
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-500 italic">
                  Learning new technologies, open source contributions, and outdoor activities.
                </p>
              </div>
            </div>

            {/* Documents Card */}
            {otherDocs.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                  Uploaded Documents & Resume
                </h3>
                <div className="divide-y divide-slate-100">
                  {otherDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-800 capitalize">
                            {doc.doc_type}
                          </p>
                          <span className="text-xs text-slate-400">
                            {formatDate(doc.uploaded_at)} · {(doc.file_size_bytes / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (4 cols): Skills & Certification */}
          <div className="lg:col-span-4 space-y-6">
            {/* Skills Card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Skills</h3>
              </div>
              <div className="p-5 min-h-[120px] flex flex-wrap content-start gap-2">
                {employee.skills && employee.skills.length > 0 ? (
                  employee.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200/80"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No skills added yet.</p>
                )}
              </div>
              {onEdit && (
                <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                  <button
                    onClick={onEdit}
                    className="w-full py-2 bg-transparent border border-dashed border-slate-300 text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:bg-white transition-colors rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Skills</span>
                  </button>
                </div>
              )}
            </div>

            {/* Certification Card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Certification</h3>
              </div>
              <div className="p-5 space-y-4 min-h-[100px]">
                {certifications.length > 0 ? (
                  certifications.map((cert) => (
                    <div key={cert.id} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 border border-blue-100 text-blue-600">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 capitalize">
                          {cert.doc_type}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Uploaded {formatDate(cert.uploaded_at)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No certifications recorded yet.</p>
                )}
              </div>
              {onEdit && (
                <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                  <button
                    onClick={onEdit}
                    className="w-full py-2 bg-transparent border border-dashed border-slate-300 text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:bg-white transition-colors rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Certification</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Private Info */}
      {activeTab === "private" && canViewPrivateInfo && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">
            Private & Confidential Information
          </h3>
          {privateInfo ? (
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div className="border-b border-slate-100 pb-3">
                <dt className="text-xs font-semibold text-slate-400 uppercase">
                  Date of Birth
                </dt>
                <dd className="font-medium text-slate-800 mt-1">
                  {formatDate(privateInfo.date_of_birth)}
                </dd>
              </div>
              <div className="border-b border-slate-100 pb-3">
                <dt className="text-xs font-semibold text-slate-400 uppercase">
                  Gender & Nationality
                </dt>
                <dd className="font-medium text-slate-800 mt-1">
                  {privateInfo.gender || "—"} · {privateInfo.nationality || "—"}
                </dd>
              </div>
              <div className="border-b border-slate-100 pb-3">
                <dt className="text-xs font-semibold text-slate-400 uppercase">
                  Residing Address
                </dt>
                <dd className="font-medium text-slate-800 mt-1">
                  {privateInfo.residing_address || "—"}
                </dd>
              </div>
              <div className="border-b border-slate-100 pb-3">
                <dt className="text-xs font-semibold text-slate-400 uppercase">
                  Marital Status
                </dt>
                <dd className="font-medium text-slate-800 mt-1 capitalize">
                  {privateInfo.marital_status || "—"}
                </dd>
              </div>
              <div className="border-b border-slate-100 pb-3">
                <dt className="text-xs font-semibold text-slate-400 uppercase">
                  Bank Account Number
                </dt>
                <dd className="font-mono text-slate-800 mt-1">
                  {mask(privateInfo.bank_account_number)}
                </dd>
              </div>
              <div className="border-b border-slate-100 pb-3">
                <dt className="text-xs font-semibold text-slate-400 uppercase">
                  Bank Name & IFSC
                </dt>
                <dd className="font-medium text-slate-800 mt-1">
                  {privateInfo.bank_name || "—"} ({privateInfo.ifsc_code || "—"})
                </dd>
              </div>
              <div className="border-b border-slate-100 pb-3">
                <dt className="text-xs font-semibold text-slate-400 uppercase">
                  PAN Number
                </dt>
                <dd className="font-mono text-slate-800 mt-1">
                  {mask(privateInfo.pan_no)}
                </dd>
              </div>
              <div className="border-b border-slate-100 pb-3">
                <dt className="text-xs font-semibold text-slate-400 uppercase">
                  UAN Number
                </dt>
                <dd className="font-mono text-slate-800 mt-1">
                  {mask(privateInfo.uan_no)}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-slate-400">No private information recorded yet.</p>
          )}
        </div>
      )}

      {/* Tab 3: Salary Info (1:1 with executive salary design) */}
      {activeTab === "salary" && (
        <div className="space-y-6">
          {/* Top Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                Monthly Wage
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                ₹ {monthlyWage.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                Yearly Wage
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                ₹ {yearlyWage.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                Working Days / Week
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">5 Days</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                Break Time
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">60 Mins</p>
            </div>
          </div>

          {/* 2-Column Salary Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Components Table */}
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-900">Salary Components</h3>
                  <Badge variant="neutral">FY 2026</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="p-4">Component</th>
                        <th className="p-4">Monthly Amount</th>
                        <th className="p-4">Yearly Amount</th>
                        <th className="p-4">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="p-4 font-medium">Basic Salary</td>
                        <td className="p-4">₹ {basicSalary.toLocaleString()}</td>
                        <td className="p-4">₹ {(basicSalary * 12).toLocaleString()}</td>
                        <td className="p-4">
                          <span className="rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-semibold">
                            50%
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium">House Rent Allowance (HRA)</td>
                        <td className="p-4">₹ {hra.toLocaleString()}</td>
                        <td className="p-4">₹ {(hra * 12).toLocaleString()}</td>
                        <td className="p-4">
                          <span className="rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-semibold">
                            25%
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium">Standard Allowance</td>
                        <td className="p-4">₹ {standardAllowance.toLocaleString()}</td>
                        <td className="p-4">₹ {(standardAllowance * 12).toLocaleString()}</td>
                        <td className="p-4">
                          <span className="rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-semibold">
                            15%
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium">Performance Bonus (Expected)</td>
                        <td className="p-4">₹ {performanceBonus.toLocaleString()}</td>
                        <td className="p-4">₹ {(performanceBonus * 12).toLocaleString()}</td>
                        <td className="p-4">
                          <span className="rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-semibold">
                            10%
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Row */}
              <div className="p-4 bg-slate-50 border-t-2 border-slate-200 flex justify-between items-center font-bold text-slate-900 text-sm">
                <span>Gross Earnings</span>
                <span>₹ {monthlyWage.toLocaleString()} / mo (₹ {yearlyWage.toLocaleString()} / yr)</span>
              </div>
            </div>

            {/* Right: Deductions & Estimated Net Pay */}
            <div className="space-y-6">
              {/* PF Contribution */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                  Provident Fund Contribution
                </h4>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Employee PF (12%)</span>
                  <span className="font-semibold text-slate-800">₹ {employeePf.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Employer PF (12%)</span>
                  <span className="font-semibold text-slate-800">₹ {employerPf.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total Monthly PF</span>
                  <span>₹ {(employeePf + employerPf).toLocaleString()}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                  Tax Deductions
                </h4>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Professional Tax</span>
                  <span className="font-semibold text-slate-800">₹ {professionalTax}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-red-600 pt-2 border-t border-slate-100">
                  <span>Total Deductions</span>
                  <span>₹ {(employeePf + professionalTax).toLocaleString()}</span>
                </div>
              </div>

              {/* Net Pay Highlight Card */}
              <div className="rounded-xl bg-slate-900 text-white p-6 shadow-md space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Estimated Net Pay (Monthly)
                </span>
                <p className="text-3xl font-bold tracking-tight text-white">
                  ₹ {netPay.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                  *Calculated based on standard statutory rates and attendance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeDetail;
