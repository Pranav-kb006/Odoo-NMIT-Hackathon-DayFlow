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
import { Pencil, Users, Search } from "lucide-react";
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

function getStatusVariant(status?: "active" | "inactive"): "success" | "slate" {
  return status === "active" ? "success" : "slate";
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
        icon={Users}
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
        icon={Search}
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
        <div className="flex gap-2">
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
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
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
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(employee)}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((employee) => (
          <Card key={employee.id}>
            <Link href={`/dashboard/employees/${employee.id}`} className="block">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700"
                  >
                    {getInitials(employee)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">
                      {getDisplayName(employee)}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {employee.login_id}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(employee.status)}>
                    {employee.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <dl className="mt-3 space-y-1 text-sm text-slate-600">
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-400">Department</dt>
                    <dd className="truncate">{employee.department || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-400">Position</dt>
                    <dd className="truncate">{employee.job_position || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-400">Joined</dt>
                    <dd className="tabular-nums">
                      {formatJoiningDate(employee.date_of_joining)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Link>
            <div className="border-t border-slate-100 p-3">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => onEdit(employee)}
              >
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <>
      <div className="hidden md:block">
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
                {Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
                        <div className="space-y-1">
                          <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
                          <div className="h-2 w-20 animate-pulse rounded bg-slate-100" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                    </TableCell>
                    <TableCell>
                      <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
                    </TableCell>
                    <TableCell>
                      <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="ml-auto h-8 w-16 animate-pulse rounded-lg bg-slate-200" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="mt-3 space-y-3 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
                  <div className="h-2 w-20 animate-pulse rounded bg-slate-100" />
                </div>
                <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

export default EmployeeTable;
