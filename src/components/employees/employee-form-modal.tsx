"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import type { Employee, EmployeeFormValues } from "./types";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  employee?: Employee;
  managers: Employee[];
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: EmployeeFormValues) => void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Partial<Record<keyof EmployeeFormValues, string>>;

const EMPTY_FORM: EmployeeFormValues = {
  first_name: "",
  last_name: "",
  personal_email: "",
  work_email: "",
  mobile: "",
  date_of_joining: "",
  department: "",
  job_position: "",
  manager_id: "",
  location: "",
};

function buildInitialForm(employee?: Employee): EmployeeFormValues {
  if (!employee) return { ...EMPTY_FORM };
  return {
    first_name: employee.first_name ?? "",
    last_name: employee.last_name ?? "",
    personal_email: employee.personal_email ?? "",
    work_email: employee.work_email ?? "",
    mobile: employee.mobile ?? "",
    date_of_joining: employee.date_of_joining ?? "",
    department: employee.department ?? "",
    job_position: employee.job_position ?? "",
    manager_id: employee.manager_id ?? "",
    location: employee.location ?? "",
  };
}

function getManagerLabel(manager: Employee): string {
  return `${manager.first_name} ${manager.last_name}`.trim() || manager.login_id;
}

export function EmployeeFormModal({
  open,
  mode,
  employee,
  managers,
  submitting,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<EmployeeFormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Re-seed the form whenever the modal opens or the target employee changes.
  useEffect(() => {
    if (open) {
      setValues(buildInitialForm(employee));
      setFieldErrors({});
    }
  }, [open, employee]);

  const title = mode === "create" ? "Add Employee" : "Edit Employee";
  const submitLabel = mode === "create" ? "Create" : "Save";

  const sortedManagers = useMemo(
    () =>
      [...managers].sort((a, b) =>
        getManagerLabel(a).localeCompare(getManagerLabel(b)),
      ),
    [managers],
  );

  function updateField<K extends keyof EmployeeFormValues>(
    key: K,
    value: EmployeeFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validate(next: EmployeeFormValues): FieldErrors {
    const errors: FieldErrors = {};
    if (!next.first_name.trim()) {
      errors.first_name = "First name is required.";
    }
    if (!next.last_name.trim()) {
      errors.last_name = "Last name is required.";
    }
    if (!next.work_email.trim()) {
      errors.work_email = "Work email is required.";
    } else if (!EMAIL_REGEX.test(next.work_email.trim())) {
      errors.work_email = "Enter a valid email address.";
    }
    if (
      next.personal_email.trim() &&
      !EMAIL_REGEX.test(next.personal_email.trim())
    ) {
      errors.personal_email = "Enter a valid email address.";
    }
    if (next.date_of_joining.trim()) {
      const parsed = new Date(next.date_of_joining.trim());
      const isParseable = !Number.isNaN(parsed.getTime());
      const matchesFormat = /^\d{4}-\d{2}-\d{2}$/.test(
        next.date_of_joining.trim(),
      );
      if (!isParseable || !matchesFormat) {
        errors.date_of_joining = "Use a valid date (YYYY-MM-DD).";
      }
    }
    return errors;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: EmployeeFormValues = {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      personal_email: values.personal_email.trim(),
      work_email: values.work_email.trim(),
      mobile: values.mobile.trim(),
      date_of_joining: values.date_of_joining.trim(),
      department: values.department.trim(),
      job_position: values.job_position.trim(),
      manager_id: values.manager_id,
      location: values.location.trim(),
    };
    const errors = validate(next);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    onSubmit(next);
  }

  const inputBaseClass = "mt-1 w-full";

  return (
    <Modal open={open} onClose={onClose}>
      {/* B4 Modal contract assumption: Modal renders a dialog surface and
          accepts `open`/`onClose`; header/body/footer are composed as
          children. Adjust if B4 ships ModalHeader/ModalContent/ModalFooter. */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <span aria-hidden>×</span>
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="px-5 py-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="first_name"
              className="text-sm font-medium text-slate-700"
            >
              First name <span className="text-red-600">*</span>
            </label>
            <Input
              id="first_name"
              className={inputBaseClass}
              value={values.first_name}
              onChange={(e) => updateField("first_name", e.target.value)}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.first_name)}
            />
            {fieldErrors.first_name ? (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.first_name}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="last_name"
              className="text-sm font-medium text-slate-700"
            >
              Last name <span className="text-red-600">*</span>
            </label>
            <Input
              id="last_name"
              className={inputBaseClass}
              value={values.last_name}
              onChange={(e) => updateField("last_name", e.target.value)}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.last_name)}
            />
            {fieldErrors.last_name ? (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.last_name}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="work_email"
              className="text-sm font-medium text-slate-700"
            >
              Work email <span className="text-red-600">*</span>
            </label>
            <Input
              id="work_email"
              type="email"
              className={inputBaseClass}
              value={values.work_email}
              onChange={(e) => updateField("work_email", e.target.value)}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.work_email)}
            />
            {fieldErrors.work_email ? (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.work_email}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="personal_email"
              className="text-sm font-medium text-slate-700"
            >
              Personal email
            </label>
            <Input
              id="personal_email"
              type="email"
              className={inputBaseClass}
              value={values.personal_email}
              onChange={(e) => updateField("personal_email", e.target.value)}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.personal_email)}
            />
            {fieldErrors.personal_email ? (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.personal_email}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="mobile"
              className="text-sm font-medium text-slate-700"
            >
              Mobile
            </label>
            <Input
              id="mobile"
              type="tel"
              className={inputBaseClass}
              value={values.mobile}
              onChange={(e) => updateField("mobile", e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label
              htmlFor="date_of_joining"
              className="text-sm font-medium text-slate-700"
            >
              Date of joining
            </label>
            <Input
              id="date_of_joining"
              type="date"
              className={inputBaseClass}
              value={values.date_of_joining}
              onChange={(e) => updateField("date_of_joining", e.target.value)}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.date_of_joining)}
            />
            {fieldErrors.date_of_joining ? (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.date_of_joining}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="department"
              className="text-sm font-medium text-slate-700"
            >
              Department
            </label>
            <Input
              id="department"
              className={inputBaseClass}
              value={values.department}
              onChange={(e) => updateField("department", e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label
              htmlFor="job_position"
              className="text-sm font-medium text-slate-700"
            >
              Job position
            </label>
            <Input
              id="job_position"
              className={inputBaseClass}
              value={values.job_position}
              onChange={(e) => updateField("job_position", e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label
              htmlFor="manager_id"
              className="text-sm font-medium text-slate-700"
            >
              Manager
            </label>
            <select
              id="manager_id"
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              value={values.manager_id}
              onChange={(e) => updateField("manager_id", e.target.value)}
              disabled={submitting}
            >
              <option value="">None</option>
              {sortedManagers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {getManagerLabel(manager)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="location"
              className="text-sm font-medium text-slate-700"
            >
              Location
            </label>
            <Input
              id="location"
              className={inputBaseClass}
              value={values.location}
              onChange={(e) => updateField("location", e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EmployeeFormModal;
