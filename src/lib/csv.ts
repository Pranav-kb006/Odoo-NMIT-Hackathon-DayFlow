import type {
  CsvEmployeeRow,
  CsvParseResult,
  CsvRowError,
  ExportEmployee,
} from "../components/employees/types";

export const employeeCsvHeaders = [
  "first_name",
  "last_name",
  "personal_email",
  "work_email",
  "mobile",
  "date_of_joining",
  "department",
  "job_position",
  "manager_id",
  "location",
] as const;

const IMPORT_KEYS = employeeCsvHeaders;
const IMPORT_KEY_SET = new Set<string>(IMPORT_KEYS);

const RAW_HEADER_ALIASES: Record<string, string> = {
  firstname: "first_name",
  "first name": "first_name",
  fname: "first_name",
  lastname: "last_name",
  "last name": "last_name",
  lname: "last_name",
  email: "work_email",
  workemail: "work_email",
  "work email": "work_email",
  personalemail: "personal_email",
  "personal email": "personal_email",
  "personal e-mail": "personal_email",
  phone: "mobile",
  mobile: "mobile",
  doj: "date_of_joining",
  joiningdate: "date_of_joining",
  "joining date": "date_of_joining",
  dateofjoining: "date_of_joining",
  "date of joining": "date_of_joining",
  dept: "department",
  department: "department",
  designation: "job_position",
  position: "job_position",
  jobtitle: "job_position",
  "job title": "job_position",
  job_position: "job_position",
  manager: "manager_id",
  managerid: "manager_id",
  "manager id": "manager_id",
  loc: "location",
  location: "location",
};

const HEADER_ALIASES: Record<string, string> = {};
for (const [rawKey, canonical] of Object.entries(RAW_HEADER_ALIASES)) {
  HEADER_ALIASES[normalizeHeader(rawKey)] = canonical;
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function mapHeader(header: string): string | null {
  const normalized = normalizeHeader(header);
  if (IMPORT_KEY_SET.has(normalized)) return normalized;
  return HEADER_ALIASES[normalized] ?? null;
}

function isValidEmail(value: string): boolean {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
}

function isValidIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function parseCsvRecords(text: string): string[][] {
  const records: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const n = text.length;
  let i = 0;

  while (i < n) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (char === "\r") {
      if (text[i + 1] === "\n") i += 1;
      row.push(field);
      records.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    if (char === "\n") {
      row.push(field);
      records.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    field += char;
    i += 1;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    records.push(row);
  }

  return records;
}

function isBlankRecord(record: string[]): boolean {
  return record.length === 1 && record[0] === "";
}

export function parseEmployeeCsv(text: string): CsvParseResult {
  const allRecords = parseCsvRecords(text).filter((r) => !isBlankRecord(r));

  if (allRecords.length === 0) {
    return { rows: [], errors: [], totalRows: 0 };
  }

  const rawHeaders = allRecords[0];
  const canonicalHeaders: (string | null)[] = rawHeaders.map((h) => mapHeader(h));

  const rows: CsvEmployeeRow[] = [];
  const errors: CsvRowError[] = [];

  for (let r = 1; r < allRecords.length; r++) {
    const cells = allRecords[r];
    const sourceRow = r;
    const record: Record<string, string> = {};
    for (const key of IMPORT_KEYS) record[key] = "";

    for (let c = 0; c < canonicalHeaders.length; c++) {
      const key = canonicalHeaders[c];
      if (key === null) continue;
      record[key] = (cells[c] ?? "").trim();
    }

    const rowErrors: CsvRowError[] = [];

    if (!record.first_name) {
      rowErrors.push({
        row: sourceRow,
        field: "first_name",
        message: "first_name is required",
      });
    }
    if (!record.last_name) {
      rowErrors.push({
        row: sourceRow,
        field: "last_name",
        message: "last_name is required",
      });
    }
    if (!record.work_email) {
      rowErrors.push({
        row: sourceRow,
        field: "work_email",
        message: "work_email is required",
      });
    } else if (!isValidEmail(record.work_email)) {
      rowErrors.push({
        row: sourceRow,
        field: "work_email",
        message: "work_email is not a valid email",
      });
    }
    if (record.date_of_joining && !isValidIsoDate(record.date_of_joining)) {
      rowErrors.push({
        row: sourceRow,
        field: "date_of_joining",
        message: "date_of_joining must be a valid YYYY-MM-DD date",
      });
    }

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      continue;
    }

    rows.push({
      first_name: record.first_name,
      last_name: record.last_name,
      personal_email: record.personal_email,
      work_email: record.work_email,
      mobile: record.mobile,
      date_of_joining: record.date_of_joining,
      department: record.department,
      job_position: record.job_position,
      manager_id: record.manager_id,
      location: record.location,
      source_row: sourceRow,
    });
  }

  return { rows, errors, totalRows: allRecords.length - 1 };
}

function escapeCsvValue(value: string): string {
  if (/["\r\n,]/.test(value)) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

export function serializeEmployeesCsv(rows: ExportEmployee[]): string {
  const lines: string[] = [];
  lines.push(employeeCsvHeaders.join(","));

  for (const row of rows) {
    const cells = employeeCsvHeaders.map((header) => {
      const value = (row as Record<string, unknown>)[header];
      return escapeCsvValue(value == null ? "" : String(value));
    });
    lines.push(cells.join(","));
  }

  return lines.join("\r\n") + "\r\n";
}

export function downloadableEmployeeTemplate(): string {
  return employeeCsvHeaders.join(",") + "\r\n";
}
