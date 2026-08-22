"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Pencil,
  FileText,
  Download,
  Award,
  Plus,
  ArrowLeft,
  Lock,
  Building,
  User,
  CreditCard,
  ShieldCheck,
  Calendar as CalendarIcon,
} from "lucide-react";
import type { Employee } from "@/components/employees/types";
import {
  getStoredPrivateInfo,
  saveStoredPrivateInfo,
  getStoredBio,
  saveStoredBio,
  type EmployeePrivateInfo,
  type EmployeeBio,
} from "@/lib/private-info-store";
import { calculateSalaryBreakdown } from "@/lib/payroll";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { showToast } from "@/components/ui/Toast";

type SalaryStructure = {
  base_salary: number;
  hra?: number | null;
  allowances?: Record<string, number> | null;
  deduction_pct?: number | null;
  effective_from?: string | null;
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
  return `•••• •••• ${value.slice(-4)}`;
}

export function EmployeeDetail({
  employee,
  documents = [],
  salary = null,
  canViewPrivateInfo = true,
  isCurrentUser = false,
  isAdmin = false,
}: {
  employee: Employee;
  companyName?: string;
  privateInfo?: EmployeePrivateInfo | null;
  documents?: UserDocument[];
  salary?: SalaryStructure | null;
  canViewPrivateInfo?: boolean;
  isCurrentUser?: boolean;
  isAdmin?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"resume" | "private" | "salary">("resume");

  const [privateInfoState, setPrivateInfoState] = useState<EmployeePrivateInfo>(() =>
    getStoredPrivateInfo(employee.id)
  );

  const [bioState, setBioState] = useState<EmployeeBio>(() =>
    getStoredBio(employee.id)
  );

  // Real wage comes from the salary structure; fall back to a guess only when
  // HR hasn't configured one yet (so the breakdown still renders something).
  const [monthlyWage, setMonthlyWage] = useState<number>(() =>
    salary?.base_salary != null && salary.base_salary > 0
      ? Number(salary.base_salary)
      : 0
  );
  const [hasSalary, setHasSalary] = useState<boolean>(() =>
    salary?.base_salary != null && salary.base_salary > 0
  );

  // Modals
  const [editPrivateModalOpen, setEditPrivateModalOpen] = useState(false);
  const [editBioModalOpen, setEditBioModalOpen] = useState(false);
  const [editWageModalOpen, setEditWageModalOpen] = useState(false);

  // Form states
  const [privateForm, setPrivateForm] = useState<EmployeePrivateInfo>(privateInfoState);
  const [bioForm, setBioForm] = useState<EmployeeBio>(bioState);
  const [wageInput, setWageInput] = useState(monthlyWage.toString());
  const [newSkillInput, setNewSkillInput] = useState("");

  useEffect(() => {
    setPrivateInfoState(getStoredPrivateInfo(employee.id));
    setBioState(getStoredBio(employee.id));
  }, [employee.id]);

  const fullName = `${employee.first_name} ${employee.last_name}`.trim() || "Employee";

  // Editable check: True if user is viewing their own profile, or is an admin, or has private info permission
  const canEditProfile = isCurrentUser || isAdmin || canViewPrivateInfo;

  const handleSavePrivateInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveStoredPrivateInfo(employee.id, privateForm);
    setPrivateInfoState(updated);
    setEditPrivateModalOpen(false);
    showToast("Private Info Updated", "Your personal & confidential details have been saved.", "success");
  };

  const handleSaveBio = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveStoredBio(employee.id, bioForm);
    setBioState(updated);
    setEditBioModalOpen(false);
    showToast("Overview Updated", "Your profile overview has been updated.", "success");
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    const updatedSkills = [...bioForm.skills, newSkillInput.trim()];
    setBioForm({ ...bioForm, skills: updatedSkills });
    setNewSkillInput("");
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = bioForm.skills.filter((_, i) => i !== index);
    setBioForm({ ...bioForm, skills: updatedSkills });
  };

  const handleSaveWage = async (e: React.FormEvent) => {
    e.preventDefault();
    const wage = parseFloat(wageInput);
    if (isNaN(wage) || wage <= 0) return;

    try {
      const res = await fetch(`/api/employees/${employee.id}/salary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseSalary: wage }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Salary update failed");
      }
      const d = await res.json();
      const base = Number(d?.salary?.base_salary ?? wage);
      setMonthlyWage(base);
      setHasSalary(true);
      setEditWageModalOpen(false);
      showToast("Salary Structure Updated", `Base monthly wage set to ${formatCurrency(base)}`, "success");
    } catch (err: unknown) {
      showToast("Update Failed", err instanceof Error ? err.message : "Could not save salary", "error");
    }
  };

  const salaryBreakdown = calculateSalaryBreakdown(monthlyWage);
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

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

      {/* Top Profile Header Card */}
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

              {canEditProfile && (
                <button
                  onClick={() => {
                    setBioForm(bioState);
                    setEditBioModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edit Profile Overview</span>
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
                  Dayflow Global
                </span>
              </div>

              <div className="border-b border-slate-100 pb-2.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Department
                </span>
                <span className="text-sm font-medium text-slate-800 mt-0.5 block truncate">
                  {employee.department || "General"}
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
                  Work Email
                </span>
                <span className="text-sm font-medium text-slate-800 mt-0.5 block truncate">
                  {employee.work_email || "—"}
                </span>
              </div>

              <div className="border-b border-slate-100 pb-2.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Mobile
                </span>
                <span className="text-sm font-mono text-slate-800 mt-0.5 block truncate">
                  {employee.mobile || "+1 (555) 019-2834"}
                </span>
              </div>

              <div className="border-b border-slate-100 pb-2.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Location
                </span>
                <span className="text-sm font-medium text-slate-800 mt-0.5 block truncate">
                  {employee.location || "San Francisco, CA (Hybrid)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex border-b border-slate-200 w-full overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("resume")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === "resume"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          Resume & Overview
        </button>

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

      {/* ─── TAB 1: Resume & Overview ─── */}
      {activeTab === "resume" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">About</h3>
                {canEditProfile && (
                  <button
                    onClick={() => {
                      setBioForm(bioState);
                      setEditBioModalOpen(true);
                    }}
                    className="text-slate-400 hover:text-blue-600 p-1"
                    title="Edit About"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                {bioState.about}
              </p>

              <div className="flex justify-between items-center border-b border-slate-100 pb-2 pt-2">
                <h3 className="text-base font-bold text-slate-900">What I love about my job</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                {bioState.what_i_love}
              </p>

              <div className="flex justify-between items-center border-b border-slate-100 pb-2 pt-2">
                <h3 className="text-base font-bold text-slate-900">My interests and hobbies</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                {bioState.hobbies}
              </p>
            </div>

            {documents.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                  Uploaded Documents & Resume
                </h3>
                <div className="divide-y divide-slate-100">
                  {documents.map((doc) => (
                    <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
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

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900">Skills</h3>
              </div>
              <div className="p-5 min-h-[140px] flex flex-wrap content-start gap-2">
                {bioState.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200/80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              {canEditProfile && (
                <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                  <button
                    onClick={() => {
                      setBioForm(bioState);
                      setEditBioModalOpen(true);
                    }}
                    className="w-full py-2 bg-transparent border border-dashed border-slate-300 text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:bg-white transition-colors rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Manage Skills</span>
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Certification</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 border border-blue-100 text-blue-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Certified Usability Analyst
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Human Factors International · 2022
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: Private Info ─── */}
      {activeTab === "private" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Private & Confidential Information</h3>
            {canEditProfile && (
              <button
                onClick={() => {
                  setPrivateForm(privateInfoState);
                  setEditPrivateModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
                <span>Edit Private Info</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Personal Details */}
            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span>Personal Details</span>
                </h4>
                {canEditProfile && (
                  <button
                    onClick={() => {
                      setPrivateForm(privateInfoState);
                      setEditPrivateModalOpen(true);
                    }}
                    className="text-slate-400 hover:text-blue-600 p-1"
                    title="Edit Personal Details"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Date of Birth
                  </span>
                  <span className="font-medium text-slate-800 mt-0.5 block">
                    {formatDate(privateInfoState.date_of_birth)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Gender
                  </span>
                  <span className="font-medium text-slate-800 mt-0.5 block">
                    {privateInfoState.gender || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Marital Status
                  </span>
                  <span className="font-medium text-slate-800 mt-0.5 block">
                    {privateInfoState.marital_status || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Nationality
                  </span>
                  <span className="font-medium text-slate-800 mt-0.5 block">
                    {privateInfoState.nationality || "—"}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Personal Email
                  </span>
                  <span className="font-medium text-slate-800 mt-0.5 block">
                    {privateInfoState.personal_email || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Bank Details */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span>Bank Details</span>
                </h4>
                {canEditProfile && (
                  <button
                    onClick={() => {
                      setPrivateForm(privateInfoState);
                      setEditPrivateModalOpen(true);
                    }}
                    className="text-slate-400 hover:text-blue-600 p-1"
                    title="Edit Bank Details"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Bank Name
                  </span>
                  <span className="font-medium text-slate-800 mt-0.5 block">
                    {privateInfoState.bank_name || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Account Name
                  </span>
                  <span className="font-medium text-slate-800 mt-0.5 block">
                    {privateInfoState.account_name || fullName}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Account Number
                  </span>
                  <span className="font-mono text-slate-800 mt-0.5 block">
                    {mask(privateInfoState.bank_account_number)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Routing Number / IFSC
                  </span>
                  <span className="font-mono text-slate-800 mt-0.5 block">
                    {privateInfoState.routing_number || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Address Information */}
            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building className="h-4 w-4 text-amber-600" />
                  <span>Address Information</span>
                </h4>
                {canEditProfile && (
                  <button
                    onClick={() => {
                      setPrivateForm(privateInfoState);
                      setEditPrivateModalOpen(true);
                    }}
                    className="text-slate-400 hover:text-blue-600 p-1"
                    title="Edit Address"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Current Residing Address
                </span>
                <p className="font-medium text-slate-800 mt-1 text-sm leading-relaxed">
                  {privateInfoState.residing_address || "No address recorded."}
                </p>
              </div>
            </div>

            {/* Card 4: Identity & Visas */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-600" />
                  <span>Identity & Visas</span>
                </h4>
                {canEditProfile && (
                  <button
                    onClick={() => {
                      setPrivateForm(privateInfoState);
                      setEditPrivateModalOpen(true);
                    }}
                    className="text-slate-400 hover:text-blue-600 p-1"
                    title="Edit Identity Numbers"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    PAN Number
                  </span>
                  <span className="font-mono text-slate-800 mt-0.5 block">
                    {privateInfoState.pan_no || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    UAN Number
                  </span>
                  <span className="font-mono text-slate-800 mt-0.5 block">
                    {privateInfoState.uan_no || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: Salary Info (PRD §5.6 Breakdown, Read-Only for Employees) ─── */}
      {activeTab === "salary" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Salary Structure & Breakdown</h3>
              <p className="text-xs text-slate-500">PRD §5.6 Salary Computation</p>
            </div>

            {!isAdmin ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-medium text-xs border border-slate-200">
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                <span>Read-Only View (Managed by HR/Admin)</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  setWageInput(monthlyWage.toString());
                  setEditWageModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
              >
                <Pencil className="h-4 w-4" />
                <span>Edit Base Wage</span>
              </button>
            )}
          </div>

          {!hasSalary && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              No salary structure has been configured for this employee yet. An admin can set the
              base wage using <span className="font-semibold">Edit Base Wage</span> above — it will
              then appear here and in the Payroll tab.
            </div>
          )}

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Monthly Wage
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                {formatCurrency(salaryBreakdown.monthlyWage)}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Yearly Wage
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                {formatCurrency(salaryBreakdown.monthlyWage * 12)}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Working Days / Wk
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-1">5 Days</p>
            </div>

            <div className="bg-emerald-600 text-white border border-emerald-700 rounded-xl p-4 shadow-sm">
              <span className="block text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">
                Net Monthly Pay
              </span>
              <p className="text-2xl font-bold text-white mt-1 font-mono">
                {formatCurrency(salaryBreakdown.netPay)}
              </p>
            </div>
          </div>

          {/* Salary Components Table & Deductions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-sm text-slate-900">
                Salary Components
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/60 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                      <th className="p-3">Component</th>
                      <th className="p-3 font-mono text-right">Monthly</th>
                      <th className="p-3 font-mono text-right">Yearly</th>
                      <th className="p-3 text-center">% of Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    <tr>
                      <td className="p-3 font-medium">Basic Salary (50%)</td>
                      <td className="p-3 font-mono text-right">{formatCurrency(salaryBreakdown.basic)}</td>
                      <td className="p-3 font-mono text-right">{formatCurrency(salaryBreakdown.basic * 12)}</td>
                      <td className="p-3 text-center"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">50%</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">House Rent Allowance (HRA 50% of Basic)</td>
                      <td className="p-3 font-mono text-right">{formatCurrency(salaryBreakdown.hra)}</td>
                      <td className="p-3 font-mono text-right">{formatCurrency(salaryBreakdown.hra * 12)}</td>
                      <td className="p-3 text-center"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">25%</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Standard Allowance (Flat)</td>
                      <td className="p-3 font-mono text-right">{formatCurrency(salaryBreakdown.standardAllowance)}</td>
                      <td className="p-3 font-mono text-right">{formatCurrency(salaryBreakdown.standardAllowance * 12)}</td>
                      <td className="p-3 text-center"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">Fixed</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Performance Bonus (8.33%)</td>
                      <td className="p-3 font-mono text-right">{formatCurrency(salaryBreakdown.performanceBonus)}</td>
                      <td className="p-3 font-mono text-right">{formatCurrency(salaryBreakdown.performanceBonus * 12)}</td>
                      <td className="p-3 text-center"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">8.33%</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Leave Travel Allowance (LTA)</td>
                      <td className="p-3 font-mono text-right">{formatCurrency(salaryBreakdown.lta)}</td>
                      <td className="p-3 font-mono text-right">{formatCurrency(salaryBreakdown.lta * 12)}</td>
                      <td className="p-3 text-center"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">8.33%</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Fixed Allowance (Balance)</td>
                      <td className="p-3 font-mono text-right">{formatCurrency(salaryBreakdown.fixedAllowance)}</td>
                      <td className="p-3 font-mono text-right">{formatCurrency(salaryBreakdown.fixedAllowance * 12)}</td>
                      <td className="p-3 text-center"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">Bal</span></td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                      <td className="p-3">Total Gross Earnings</td>
                      <td className="p-3 font-mono text-right">{formatCurrency(salaryBreakdown.monthlyWage)}</td>
                      <td className="p-3 font-mono text-right">{formatCurrency(salaryBreakdown.monthlyWage * 12)}</td>
                      <td className="p-3 text-center">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Deductions & Net Pay */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                  Deductions (Estimated)
                </h4>
                <div className="flex justify-between text-xs py-1 border-b border-slate-50 text-red-600">
                  <span>Employee PF (12% of Basic)</span>
                  <span className="font-mono">-{formatCurrency(salaryBreakdown.employeePf)}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-50 text-red-600">
                  <span>Professional Tax</span>
                  <span className="font-mono">-{formatCurrency(salaryBreakdown.professionalTax)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-1 text-red-700">
                  <span>Total Deductions</span>
                  <span className="font-mono">-{formatCurrency(salaryBreakdown.totalDeductions)}</span>
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Final Take-Home Pay
                </span>
                <p className="text-3xl font-bold font-mono text-emerald-400">
                  {formatCurrency(salaryBreakdown.netPay)}
                </p>
                <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  Calculated automatically based on PRD §5.6 rules.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 1: Edit Private Info (Employee Editable) ─── */}
      {editPrivateModalOpen && (
        <Modal open={editPrivateModalOpen} onClose={() => setEditPrivateModalOpen(false)}>
          <ModalHeader
            title="Edit Private & Confidential Information"
            description="Update your personal, bank, address, and identity details"
            onClose={() => setEditPrivateModalOpen(false)}
          />
          <form onSubmit={handleSavePrivateInfo}>
            <ModalBody className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={privateForm.date_of_birth ?? ""}
                    onChange={(e) => setPrivateForm({ ...privateForm, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-blue-600 focus:ring-0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Gender
                  </label>
                  <select
                    value={privateForm.gender ?? "Male"}
                    onChange={(e) => setPrivateForm({ ...privateForm, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-blue-600 focus:ring-0"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Marital Status
                  </label>
                  <select
                    value={privateForm.marital_status ?? "Single"}
                    onChange={(e) => setPrivateForm({ ...privateForm, marital_status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-blue-600 focus:ring-0"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={privateForm.nationality ?? ""}
                    onChange={(e) => setPrivateForm({ ...privateForm, nationality: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-blue-600 focus:ring-0"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Personal Email
                  </label>
                  <input
                    type="email"
                    value={privateForm.personal_email ?? ""}
                    onChange={(e) => setPrivateForm({ ...privateForm, personal_email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-blue-600 focus:ring-0"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Current Residing Address
                  </label>
                  <textarea
                    rows={2}
                    value={privateForm.residing_address ?? ""}
                    onChange={(e) => setPrivateForm({ ...privateForm, residing_address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-blue-600 focus:ring-0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={privateForm.bank_name ?? ""}
                    onChange={(e) => setPrivateForm({ ...privateForm, bank_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-blue-600 focus:ring-0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={privateForm.account_name ?? ""}
                    onChange={(e) => setPrivateForm({ ...privateForm, account_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-blue-600 focus:ring-0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={privateForm.bank_account_number ?? ""}
                    onChange={(e) => setPrivateForm({ ...privateForm, bank_account_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-blue-600 focus:ring-0 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Routing Number / IFSC
                  </label>
                  <input
                    type="text"
                    value={privateForm.routing_number ?? ""}
                    onChange={(e) => setPrivateForm({ ...privateForm, routing_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-blue-600 focus:ring-0 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    value={privateForm.pan_no ?? ""}
                    onChange={(e) => setPrivateForm({ ...privateForm, pan_no: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-blue-600 focus:ring-0 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    UAN Number
                  </label>
                  <input
                    type="text"
                    value={privateForm.uan_no ?? ""}
                    onChange={(e) => setPrivateForm({ ...privateForm, uan_no: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-blue-600 focus:ring-0 font-mono"
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <button
                type="button"
                onClick={() => setEditPrivateModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Private Info
              </button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* ─── MODAL 2: Edit Bio & Overview ─── */}
      {editBioModalOpen && (
        <Modal open={editBioModalOpen} onClose={() => setEditBioModalOpen(false)}>
          <ModalHeader
            title="Edit Profile Bio & Skills"
            description="Update your bio description, hobbies, and skills"
            onClose={() => setEditBioModalOpen(false)}
          />
          <form onSubmit={handleSaveBio}>
            <ModalBody className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  About Me
                </label>
                <textarea
                  rows={3}
                  value={bioForm.about ?? ""}
                  onChange={(e) => setBioForm({ ...bioForm, about: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-blue-600 focus:ring-0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  What I love about my job
                </label>
                <textarea
                  rows={2}
                  value={bioForm.what_i_love ?? ""}
                  onChange={(e) => setBioForm({ ...bioForm, what_i_love: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-blue-600 focus:ring-0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Interests & Hobbies
                </label>
                <textarea
                  rows={2}
                  value={bioForm.hobbies ?? ""}
                  onChange={(e) => setBioForm({ ...bioForm, hobbies: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-blue-600 focus:ring-0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add a new skill (e.g. Next.js)..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded text-sm font-medium hover:bg-slate-800"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {bioForm.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        className="text-slate-400 hover:text-red-500 ml-1 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <button
                type="button"
                onClick={() => setEditBioModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Overview
              </button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* ─── MODAL 3: Edit Wage (Admin Only) ─── */}
      {editWageModalOpen && (
        <Modal open={editWageModalOpen} onClose={() => setEditWageModalOpen(false)}>
          <ModalHeader
            title={`Edit Salary Structure — ${fullName}`}
            description="Set base monthly wage for salary breakdown calculation"
            onClose={() => setEditWageModalOpen(false)}
          />
          <form onSubmit={handleSaveWage}>
            <ModalBody className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Monthly Base Wage (USD)
                </label>
                <input
                  type="number"
                  step="100"
                  min="500"
                  required
                  value={wageInput}
                  onChange={(e) => setWageInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-blue-600 focus:ring-0"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <button
                type="button"
                onClick={() => setEditWageModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Wage
              </button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default EmployeeDetail;
