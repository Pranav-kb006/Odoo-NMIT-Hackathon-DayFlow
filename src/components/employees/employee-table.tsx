"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Pencil,
  Users,
  Search,
  LayoutGrid,
  List,
  Briefcase,
  Mail,
  Calendar,
  Eye,
} from "lucide-react";
import type { Employee } from "./types";

type Props = {
  employees: Employee[];
  onAdd: () => void;
  onEdit: (employee: Employee) => void;
  onImport: () => void;
  onFilteredChange?: (rows: Employee[]) => void;
  loading?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });

function formatJoiningDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

function getInitials(employee: Employee): string {
  const first = employee.first_name.trim().charAt(0);
  const last = employee.last_name.trim().charAt(0);
  return (first + last).toUpperCase() || "—";
}

function getDisplayName(employee: Employee): string {
  return `${employee.first_name} ${employee.last_name}`.trim() || "—";
}

function getStatusVariant(status?: "active" | "inactive"): "success" | "neutral" {
  return status === "active" ? "success" : "neutral";
}

function deriveDepartments(employees: Employee[]): string[] {
  const set = new Set<string>();
  for (const e of employees) {
    if (e.department && e.department.trim()) set.add(e.department.trim());
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function EmployeeTable({
  employees,
  onAdd,
  onEdit,
  onImport,
  onFilteredChange,
  loading = false,
}: Props) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const departments = useMemo(() => deriveDepartments(employees), [employees]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return employees.filter((e) => {
      if (department !== "All" && (e.department ?? "") !== department) {
        return false;
      }
      if (status !== "All" && (e.status ?? "inactive") !== status) {
        return false;
      }
      if (!query) return true;
      const haystack = [
        getDisplayName(e),
        e.login_id,
        e.work_email,
        e.department ?? "",
        e.job_position ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [employees, search, department, status]);

  useEffect(() => {
    onFilteredChange?.(filtered);
  }, [filtered, onFilteredChange]);

  function resetFilters() {
    setSearch("");
    setDepartment("All");
    setStatus("All");
  }

  if (loading) {
    return <TableSkeleton />;
  }

  if (employees.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-8 w-8" />}
        title="No employees yet"
        description="Add your first team member manually or import a batch from CSV."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={onAdd}>Add employee</Button>
            <Button variant="secondary" onClick={onImport}>
              Import CSV
            </Button>
          </div>
        }
      />
    );
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={<Search className="h-8 w-8" />}
        title="No matching employees"
        description="Try a different search term or clear the filters to see everyone."
        action={
          <Button variant="secondary" onClick={resetFilters}>
            Reset filters
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            value={search}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(event.target.value)
            }
            placeholder="Search name, login, email, department…"
            className="pl-9"
            aria-label="Search employees"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            aria-label="Filter by department"
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="All">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="All">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* View Mode Toggle (Grid vs Table) */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Card Grid View"
              aria-label="Card Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Table List View"
              aria-label="Table List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Card Structure */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((employee) => {
            const isActive = employee.status === "active";
            const fullName = getDisplayName(employee);

            return (
              <div
                key={employee.id}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-blue-400 hover:shadow-md"
              >
                {/* Status Dot Top-Right */}
                <div className="absolute right-4 top-4 flex items-center gap-1.5">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isActive ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                    title={isActive ? "Active" : "Inactive"}
                  />
                  <span className="text-[11px] font-medium text-slate-500 capitalize">
                    {employee.status ?? "active"}
                  </span>
                </div>

                {/* Profile Header (Avatar + Name + Designation) */}
                <div className="flex flex-col items-center text-center pt-2">
                  {employee.avatar_url ? (
                    <img
                      src={employee.avatar_url}
                      alt={fullName}
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-100 shadow-inner"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-base font-bold text-blue-700 ring-2 ring-slate-100 shadow-inner">
                      {getInitials(employee)}
                    </div>
                  )}

                  <h3 className="mt-3 text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {fullName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                    {employee.job_position || "Team Member"}
                  </p>
                  <span className="mt-1 font-mono text-[11px] text-slate-400">
                    ID: {employee.login_id}
                  </span>
                </div>

                {/* Details Section */}
                <div className="my-4 border-t border-b border-slate-100 py-3 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700 truncate">
                      {employee.department || "General"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500 truncate" title={employee.work_email}>
                      {employee.work_email || "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500 truncate">
                      Joined {formatJoiningDate(employee.date_of_joining)}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-auto pt-1">
                  <Link
                    href={`/dashboard/employees/${employee.id}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Profile
                  </Link>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs h-8"
                    onClick={() => onEdit(employee)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Job Position</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700"
                        >
                          {getInitials(employee)}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/dashboard/employees/${employee.id}`}
                            className="block truncate font-medium text-slate-900 hover:text-blue-600 hover:underline"
                          >
                            {getDisplayName(employee)}
                          </Link>
                          <span className="block truncate text-xs text-slate-500">
                            {employee.login_id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {employee.department || "—"}
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {employee.job_position || "—"}
                    </TableCell>
                    <TableCell className="tabular-nums text-slate-700">
                      {formatJoiningDate(employee.date_of_joining)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(employee.status)}>
                        {employee.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/employees/${employee.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Link>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onEdit(employee)}
                        >
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="p-5 space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="h-16 w-16 animate-pulse rounded-full bg-slate-200" />
            <div className="space-y-1 w-full text-center flex flex-col items-center">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-8 w-full animate-pulse rounded bg-slate-200" />
        </Card>
      ))}
    </div>
  );
}

export default EmployeeTable;
