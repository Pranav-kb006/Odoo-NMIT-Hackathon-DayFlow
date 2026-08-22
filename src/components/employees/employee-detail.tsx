import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { workingDaysBetween } from "@/lib/utils";
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

type AttendanceHistoryRow = {
  work_date: string;
  check_in: string | null;
  check_out: string | null;
};

type LeaveHistoryRow = {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
};

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return dateFmt.format(d);
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN");
}

// Mask sensitive identifiers, revealing only the last 4 characters.
function mask(value: string | null): string {
  if (!value) return "—";
  if (value.length <= 4) return value;
  return `**** ${value.slice(-4)}`;
}

function statusBadge(status: string): "success" | "neutral" {
  return status === "active" ? "success" : "neutral";
}

function attendanceStatusVariant(
  status: string,
): "success" | "danger" | "warning" | "neutral" {
  switch (status) {
    case "present":
      return "success";
    case "absent":
      return "danger";
    case "half_day":
      return "warning";
    default:
      return "neutral";
  }
}

function leaveStatusVariant(
  status: string,
): "success" | "danger" | "warning" | "neutral" {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    case "pending":
      return "warning";
    default:
      return "neutral";
  }
}

export function EmployeeDetail({
  employee,
  privateInfo,
  documents,
  attendance,
  leaveRequests,
  canViewPrivateInfo,
}: {
  employee: Employee;
  privateInfo: PrivateInfo | null;
  documents: UserDocument[];
  attendance: AttendanceHistoryRow[];
  leaveRequests: LeaveHistoryRow[];
  canViewPrivateInfo: boolean;
}) {
  const fullName = `${employee.first_name} ${employee.last_name}`.trim();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {employee.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={employee.avatar_url}
                alt={`${fullName} avatar`}
                className="mb-3 h-12 w-12 rounded-full object-cover"
              />
            ) : null}
            {fullName}
          </CardTitle>
          <CardDescription>
            {employee.login_id} · {employee.department ?? "—"} ·{" "}
            {employee.job_position ?? "—"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Profile summary
            </h3>
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Name</dt>
                <dd>{fullName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Login ID</dt>
                <dd>{employee.login_id}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Department</dt>
                <dd>{employee.department ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Job position</dt>
                <dd>{employee.job_position ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Location</dt>
                <dd>{employee.location ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Joining date</dt>
                <dd>{formatDate(employee.date_of_joining)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <Badge variant={statusBadge(employee.status ?? "active")}>
                    {employee.status ?? "active"}
                  </Badge>
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Contact
            </h3>
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Work email</dt>
                <dd>{employee.work_email}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Personal email</dt>
                <dd>{employee.personal_email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Mobile</dt>
                <dd>{employee.mobile ?? "—"}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Employment
            </h3>
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Role</dt>
                <dd className="capitalize">{employee.role}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Manager</dt>
                <dd>{employee.manager_id ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Date of joining</dt>
                <dd>{formatDate(employee.date_of_joining)}</dd>
              </div>
            </dl>
          </section>

          {canViewPrivateInfo ? (
            <section>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Private info
              </h3>
              {privateInfo ? (
                <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Date of birth</dt>
                    <dd>{formatDate(privateInfo.date_of_birth)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Residing address</dt>
                    <dd>{privateInfo.residing_address ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Gender</dt>
                    <dd className="capitalize">
                      {privateInfo.gender ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Nationality</dt>
                    <dd>{privateInfo.nationality ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Marital status</dt>
                    <dd className="capitalize">
                      {privateInfo.marital_status ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Bank account number</dt>
                    <dd>{mask(privateInfo.bank_account_number)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Bank name</dt>
                    <dd>{privateInfo.bank_name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">IFSC code</dt>
                    <dd>{mask(privateInfo.ifsc_code)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">PAN</dt>
                    <dd>{mask(privateInfo.pan_no)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">UAN</dt>
                    <dd>{mask(privateInfo.uan_no)}</dd>
                  </div>
                </dl>
              ) : (
                <EmptyState
                  title="No private information available"
                  description="This employee has not provided private details yet."
                />
              )}
            </section>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="capitalize">
                      {doc.doc_type}
                    </TableCell>
                    <TableCell>{formatDateTime(doc.uploaded_at)}</TableCell>
                    <TableCell>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        View
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No documents"
              description="No documents have been uploaded for this employee."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance history</CardTitle>
          <CardDescription>Most recent 50 records.</CardDescription>
        </CardHeader>
        <CardContent>
          {attendance.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Work date</TableHead>
                  <TableHead>Check in</TableHead>
                  <TableHead>Check out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((row) => (
                  <TableRow key={row.work_date}>
                    <TableCell>{formatDate(row.work_date)}</TableCell>
                    <TableCell>{formatDateTime(row.check_in)}</TableCell>
                    <TableCell>{formatDateTime(row.check_out)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No attendance records"
              description="No attendance history found for this employee."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leave history</CardTitle>
          <CardDescription>Most recent 50 requests.</CardDescription>
        </CardHeader>
        <CardContent>
          {leaveRequests.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRequests.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{formatDate(row.start_date)}</TableCell>
                    <TableCell>{formatDate(row.end_date)}</TableCell>
                    <TableCell>{workingDaysBetween(row.start_date, row.end_date)}</TableCell>
                    <TableCell className="max-w-48 truncate">{row.reason}</TableCell>
                    <TableCell>
                      <Badge
                        variant={leaveStatusVariant(row.status)}
                        className="capitalize"
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No leave requests"
              description="No leave requests found for this employee."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
