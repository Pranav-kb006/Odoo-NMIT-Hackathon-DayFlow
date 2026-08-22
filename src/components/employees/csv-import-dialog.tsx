"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { parseEmployeeCsv, downloadableEmployeeTemplate } from "@/lib/csv";
import type {
  CsvEmployeeRow,
  CsvImportSummary,
  CsvParseResult,
} from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  onImport: (rows: CsvEmployeeRow[]) => Promise<CsvImportSummary>;
};

type Phase = "select" | "preview" | "importing" | "done";

function resetFileInput(input: HTMLInputElement | null) {
  if (input) input.value = "";
}

function triggerTemplateDownload() {
  const csv = downloadableEmployeeTemplate();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "employees-template.csv";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function CsvImportDialog({ open, onClose, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [phase, setPhase] = useState<Phase>("select");
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<CsvImportSummary | null>(
    null,
  );
  const [importError, setImportError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number }>({
    done: 0,
    total: 0,
  });

  function resetLocalState() {
    setPhase("select");
    setParseResult(null);
    setFileError(null);
    setImportSummary(null);
    setImportError(null);
    setProgress({ done: 0, total: 0 });
    resetFileInput(fileInputRef.current);
  }

  function handleClose() {
    // Clear credentials/results from view on close so they are never
    // redisplayed (they must be shared with the employee immediately).
    resetLocalState();
    onClose();
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setImportSummary(null);
    setImportError(null);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setFileError("Only .csv files are accepted. Please choose a CSV file.");
      resetFileInput(event.target);
      return;
    }

    let text: string;
    try {
      text = await file.text();
    } catch {
      setFileError(
        "Could not read this file. Please try a different CSV file.",
      );
      resetFileInput(event.target);
      return;
    }

    const result = parseEmployeeCsv(text);
    setParseResult(result);
    setPhase("preview");
  }

  async function handleImport() {
    if (!parseResult || parseResult.rows.length === 0) return;

    const validRows = parseResult.rows;
    setPhase("importing");
    setImportError(null);
    setProgress({ done: 0, total: validRows.length });

    // Pass the full `validRows` (still containing `source_row`) to the
    // orchestrator. It needs `source_row` to report which CSV row failed,
    // and strips it at its own API boundary before the network call.
    try {
      const summary = await onImport(validRows);
      setImportSummary(summary);
      setProgress({ done: validRows.length, total: validRows.length });
      setPhase("done");
    } catch {
      setImportError(
        "Import failed while contacting the server. Please try again.",
      );
      setPhase("preview");
      setProgress({ done: 0, total: 0 });
    }
  }

  function handleChooseAnother() {
    setParseResult(null);
    setImportSummary(null);
    setImportError(null);
    setFileError(null);
    setProgress({ done: 0, total: 0 });
    setPhase("select");
    resetFileInput(fileInputRef.current);
  }

  const validCount = parseResult?.rows.length ?? 0;
  const invalidCount = parseResult?.errors.length ?? 0;
  const totalRows = parseResult?.totalRows ?? 0;

  return (
    <Modal open={open} onClose={handleClose}>
      {/* B4 Modal contract assumption: Modal renders a dialog surface and
          accepts `open`/`onClose`; header/body/footer are composed as
          children. Adjust if B4 ships ModalHeader/ModalContent/ModalFooter. */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Import employees from CSV
        </h2>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <span aria-hidden>×</span>
        </button>
      </div>

      <div className="space-y-4 px-5 py-4">
        {fileError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {fileError}
          </div>
        ) : null}

        {importError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {importError}
          </div>
        ) : null}

        {/* Step 1: file selection (also shown again after import). */}
        {(phase === "select" || phase === "importing" || phase === "done") && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="csv-file"
                className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Choose CSV file
                <input
                  id="csv-file"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={handleFileSelected}
                  disabled={phase === "importing"}
                />
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={triggerTemplateDownload}
                disabled={phase === "importing"}
              >
                Download template
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Columns: first_name, last_name, personal_email, work_email,
              mobile, date_of_joining, department, job_position, manager_id,
              location. Required: first_name, last_name, work_email.
            </p>
          </div>
        )}

        {/* Step 2: preview parsed results before submitting. */}
        {phase === "preview" && parseResult && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={validCount > 0 ? "default" : "secondary"}>
                {validCount} valid
              </Badge>
              <Badge variant={invalidCount > 0 ? "destructive" : "secondary"}>
                {invalidCount} error{invalidCount === 1 ? "" : "s"}
              </Badge>
              <span className="text-xs text-slate-500">
                {totalRows} total row{totalRows === 1 ? "" : "s"} (excluding
                header)
              </span>
            </div>

            {invalidCount > 0 ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <p className="mb-1 text-sm font-medium text-red-700">
                  Row-level errors (these rows will NOT be imported)
                </p>
                <ul className="max-h-40 space-y-1 overflow-auto text-xs text-red-700">
                  {parseResult.errors.map((err, idx) => (
                    <li key={`${err.row}-${idx}`}>
                      Row {err.row}
                      {err.field ? ` (${err.field})` : ""}: {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <p className="mb-1 text-sm font-medium text-slate-700">
                Preview of valid rows
              </p>
              {validCount === 0 ? (
                <p className="text-sm text-slate-500">
                  No valid rows to import. Fix the errors above or choose
                  another file.
                </p>
              ) : (
                <div className="max-h-56 overflow-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-3 py-2 font-medium">First name</th>
                        <th className="px-3 py-2 font-medium">Last name</th>
                        <th className="px-3 py-2 font-medium">Work email</th>
                        <th className="px-3 py-2 font-medium">Department</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {parseResult.rows.map((row) => (
                        <tr key={row.source_row}>
                          <td className="px-3 py-2">{row.first_name}</td>
                          <td className="px-3 py-2">{row.last_name}</td>
                          <td className="px-3 py-2">{row.work_email}</td>
                          <td className="px-3 py-2">
                            {row.department || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: importing progress. */}
        {phase === "importing" && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
            Importing… (Imported {progress.done} / {progress.total})
          </div>
        )}

        {/* Step 4: results. */}
        {phase === "done" && importSummary && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">
                {importSummary.created.length} created
              </Badge>
              <Badge
                variant={
                  importSummary.failures.length > 0 ? "destructive" : "secondary"
                }
              >
                {importSummary.failures.length} failed
              </Badge>
            </div>

            {importSummary.failures.length > 0 ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <p className="mb-1 text-sm font-medium text-red-700">
                  Import failures
                </p>
                <ul className="max-h-40 space-y-1 overflow-auto text-xs text-red-700">
                  {importSummary.failures.map((fail, idx) => (
                    <li key={`${fail.row}-${idx}`}>
                      Row {fail.row}: {fail.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {importSummary.created.length > 0 ? (
              <div className="rounded-lg border border-slate-200">
                <div className="border-b border-slate-200 px-3 py-2">
                  <p className="text-sm font-medium text-slate-700">
                    Generated credentials
                  </p>
                  <p className="text-xs text-slate-500">
                    Share each temporary password with the employee now — it is
                    shown only in this result view and cleared when you close.
                  </p>
                </div>
                <ul className="divide-y divide-slate-100">
                  {importSummary.created.map((item) => (
                    <li
                      key={item.employee.login_id}
                      className="grid grid-cols-1 gap-1 px-3 py-2 text-xs sm:grid-cols-2"
                    >
                      <span className="text-slate-600">
                        {item.employee.first_name}{" "}
                        {item.employee.last_name}{" "}
                        <span className="text-slate-400">
                          ({item.employee.work_email})
                        </span>
                      </span>
                      <span className="font-mono text-slate-800">
                        {item.credentials.login_id} /{" "}
                        {item.credentials.temporary_password}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Footer actions change with phase. */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-5 py-4">
        <div>
          {phase === "preview" || phase === "done" ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleChooseAnother}
            >
              Choose another file
            </Button>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={phase === "importing"}
          >
            {phase === "done" ? "Close" : "Cancel"}
          </Button>
          {phase === "preview" ? (
            <Button
              type="button"
              onClick={handleImport}
              disabled={validCount === 0}
            >
              Import {validCount} employee{validCount === 1 ? "" : "s"}
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

export default CsvImportDialog;
