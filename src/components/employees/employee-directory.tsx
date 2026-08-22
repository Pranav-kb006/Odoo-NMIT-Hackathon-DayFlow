"use client";

import { useState } from "react";
import type { Employee } from "./types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Plus, RefreshCw, Upload } from "lucide-react";
import { EmployeeStatsCards } from "./employee-stats";
import { EmployeeTable } from "./employee-table";
import { EmployeeFormModal } from "./employee-form-modal";
import { CredentialDialog } from "./credential-dialog";
import { CsvImportDialog } from "./csv-import-dialog";
import { serializeEmployeesCsv } from "@/lib/csv";
import { mapProfileToEmployee, type ProfileRow } from "@/lib/employees";
import type {
  CsvEmployeeRow,
  CsvImportSummary,
  EmployeeCreateResponse,
  EmployeeFormValues,
  EmployeeStats,
} from "./types";

type Props = {
  initialEmployees: Employee[];
  managers: Employee[];
  initialStats: EmployeeStats;
};

function deriveStats(list: Employee[], base: EmployeeStats): EmployeeStats {
  return {
    total: list.length,
    active: list.filter((e) => e.status === "active").length,
    present: base.present,
    onLeave: base.onLeave,
  };
}

export function EmployeeDirectory({
  initialEmployees,
  managers,
  initialStats,
}: Props) {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [filteredEmployees, setFilteredEmployees] =
    useState<Employee[]>(initialEmployees);
  const [stats, setStats] = useState<EmployeeStats>(initialStats);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [credentials, setCredentials] =
    useState<EmployeeCreateResponse["credentials"] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function postEmployee(
    values: EmployeeFormValues,
  ): Promise<EmployeeCreateResponse> {
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(
        data?.error ?? `Request failed with status ${res.status}.`,
      );
    }
    return (await res.json()) as EmployeeCreateResponse;
  }

  async function createEmployee(values: EmployeeFormValues): Promise<void> {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const data = await postEmployee(values);
      // API returns a raw profiles row — map to UI shape BEFORE state
      const mapped = mapProfileToEmployee(data.employee as unknown as ProfileRow);
      const next = [...employees, mapped];
      setEmployees(next);
      setStats(deriveStats(next, initialStats));
      setFormOpen(false);
      setCredentials(data.credentials);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to create employee.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function updateEmployee(
    id: string,
    values: EmployeeFormValues,
  ): Promise<void> {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error ?? `Request failed with status ${res.status}.`,
        );
      }
      const body = await res.json();
      const rawEmployee =
        body && typeof body === "object" && "employee" in body
          ? (body as { employee: unknown }).employee
          : (body as Employee);
      // map raw profiles row → UI shape before it hits the table
      const updated: Employee = mapProfileToEmployee(
        rawEmployee as unknown as ProfileRow,
      );
      const next = employees.map((e) => (e.id === id ? updated : e));
      setEmployees(next);
      setStats(deriveStats(next, initialStats));
      setFormOpen(false);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to update employee.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCsvImport(
    rows: CsvEmployeeRow[],
  ): Promise<CsvImportSummary> {
    const created: EmployeeCreateResponse[] = [];
    const failures: { row: number; message: string }[] = [];
    const newEmployees: Employee[] = [];

    for (const row of rows) {
      const sourceRow = row.source_row ?? 0;
      const { source_row: _omit, ...values } = row;
      void _omit;
      try {
        const data = await postEmployee(values as EmployeeFormValues);
        created.push(data);
        newEmployees.push(data.employee);
      } catch (e) {
        failures.push({
          row: sourceRow,
          message:
            e instanceof Error ? e.message : "Failed to create employee.",
        });
      }
    }

    if (newEmployees.length > 0) {
      const next = [...employees, ...newEmployees];
      setEmployees(next);
      setStats(deriveStats(next, initialStats));
    }

    return { created, failures };
  }

  function openAddForm() {
    setFormMode("create");
    setEditingEmployee(null);
    setError(null);
    setFormOpen(true);
  }

  function openEditForm(employee: Employee) {
    setFormMode("edit");
    setEditingEmployee(employee);
    setError(null);
    setFormOpen(true);
  }

  function handleFormSubmit(values: EmployeeFormValues) {
    if (formMode === "edit" && editingEmployee) {
      void updateEmployee(editingEmployee.id, values);
    } else {
      void createEmployee(values);
    }
  }

  function handleRefresh() {
    router.refresh();
  }

  function handleExport() {
    const csv = serializeEmployeesCsv(filteredEmployees ?? employees);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "employees.csv";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <EmployeeStatsCards stats={stats} />

      {error && !formOpen ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={openAddForm}>
          <Plus className="mr-1 h-4 w-4" />
          Add employee
        </Button>
        <Button variant="secondary" onClick={() => setCsvOpen(true)}>
          <Upload className="mr-1 h-4 w-4" />
          Import CSV
        </Button>
        <Button variant="secondary" onClick={handleExport}>
          <Download className="mr-1 h-4 w-4" />
          Export
        </Button>
        <Button variant="secondary" onClick={handleRefresh}>
          <RefreshCw className="mr-1 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <EmployeeTable
        employees={employees}
        onAdd={openAddForm}
        onEdit={openEditForm}
        onImport={() => setCsvOpen(true)}
        onFilteredChange={setFilteredEmployees}
      />

      <EmployeeFormModal
        open={formOpen}
        mode={formMode}
        employee={editingEmployee ?? undefined}
        managers={managers}
        submitting={submitting}
        error={error}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <CredentialDialog
        credentials={credentials}
        onClose={() => setCredentials(null)}
      />

      <CsvImportDialog
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onImport={handleCsvImport}
      />
    </div>
  );
}

export default EmployeeDirectory;
