# Builder 3 Employees and Directory Design

Date: 2026-08-22
Owner: Builder 3
Status: Approved for planning

## Scope

Builder 3 owns the employee directory and employee profile experience:

- `src/app/(dashboard)/employees/*`
- `src/components/employees/*`
- `src/lib/csv.ts`

The implementation follows `docs/BACKEND_STRUCTURE.md`. The current `profiles`
migration is a placeholder and is not a Builder 3 dependency or migration target.

Builder 3 does not modify auth helpers, middleware, migrations, shared UI
primitives, dashboard layout, attendance mutations, leave mutations, or payroll
logic. Builder 4's primitives are a hard dependency and will be consumed from
`src/components/ui/*`.

## Architecture

Use server-rendered pages with focused client islands:

- `/employees` fetches the initial tenant-scoped employee data through the
  authenticated server Supabase client.
- A client directory component handles search, filters, modal interactions,
  CSV preview/import, export, and refresh after mutations.
- `/employees/[id]` loads the selected employee and read-only history data. It
  presents profile information, private information for admins, documents when
  the agreed storage/API boundary exists, attendance history, and leave history.
- Mutations use the frozen employee API contracts:
  `POST /api/employees` and `PATCH /api/employees/[id]`.
- `src/lib/csv.ts` is pure and client-safe. It parses/validates CSV content and
  serializes safe employee data for export; it never calls Supabase or Auth.

## Directory Behavior

The admin directory provides:

- Responsive table on desktop and stacked rows/cards on narrow screens.
- Identity, Login ID, department, job position, joining date, and status.
- Search across name, Login ID, work email, department, and job position.
- Department and active/inactive filters.
- Empty, loading skeleton, and inline error states.
- Add employee modal using first name, last name, personal email, work email,
  mobile, date of joining, department, job position, manager, and location.
- Edit flow reusing the creation form with admin-editable fields.
- One-time display and copy action for generated Login ID and temporary
  password. The password is never stored or redisplayed by the client.

Org stats in the admin header are derived from tenant-scoped data: total
employees, active employees, currently present, and currently on leave when the
required attendance and leave data is available.

## CSV Behavior

CSV import is client-parsed and previewed before submission:

1. Accept a CSV file and normalize supported headers.
2. Validate required fields, dates, and email values locally.
3. Show row-level errors and prevent invalid rows from being submitted.
4. Submit each valid row through `/api/employees`, preserving server-side Auth
   creation, Login ID generation, and temporary password generation.
5. Report created rows, failed rows, generated credentials, and retryable errors.

Export serializes the loaded/filterable employee data with correct CSV escaping.
It excludes private information, salary, Auth identifiers, and passwords. A
downloadable template exposes the supported import headers.

## Profile Behavior

The detail page displays identity, contact, employment, and organization data.
Private info is separated and shown only to admins. Attendance and leave
history are read-only and link to their owning domains for mutations. Documents
show metadata and upload/download controls only if an existing agreed API and
storage boundary is available; no new upload contract is invented here.

Missing profile sections use explicit empty states.

## Security and Contracts

- Queries use the authenticated server Supabase client and rely on RLS for
  tenant isolation.
- Admin-only access is enforced by the existing auth/middleware contract, not
  only by hiding controls.
- The client never submits or trusts client-calculated `company_id` or role
  values for authorization.
- Directory responses and exports exclude private info, salary, Auth IDs, and
  temporary passwords.
- Employee deletion is not implemented. Inactive/deactivated behavior follows
  the final backend field exposed by the contract.
- Any new history-read endpoint must be agreed with the relevant domain owner
  before implementation.

## Verification

Unit coverage for `src/lib/csv.ts` includes quoting, commas/newlines, escaped
quotes, blank rows, header normalization, required fields, invalid dates, and
export privacy.

UI/integration verification covers search, filters, empty/loading/error states,
form validation, create/edit success and failure, one-time credential display,
CSV preview, partial import failure, and export behavior.

Manual verification covers Builder 4 primitive integration, desktop/mobile
layout, admin-only access, cross-tenant isolation, and profile visibility.

The final check runs the project's test command and `pnpm build` with no
TypeScript errors.
