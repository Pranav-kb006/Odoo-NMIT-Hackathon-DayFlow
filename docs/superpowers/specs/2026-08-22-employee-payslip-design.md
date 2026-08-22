# Employee Payslip Design

Date: 2026-08-22
Owner: Payroll implementation
Status: Approved for planning

## Scope

Build the employee-facing, read-only payslip experience described by PRD
section 5.6 using the provisioned `public.payslips` schema.

In scope:

- `/dashboard/payslip` server-rendered page.
- Latest-payslip default selection and server-rendered period selection.
- Final numeric values: payable days, base salary, HRA, allowances, gross pay,
  deductions, and net pay.
- INR formatting, responsive layout, loading/empty/error states, and employee
  navigation.
- Secure employee-only access through the existing dashboard auth boundary and
  payslip RLS.

Out of scope:

- Admin salary-structure configuration.
- Payroll generation or recomputation.
- Client-side salary formulas.
- Payslip PDF/export/download.
- PF/tax line-item breakdown not represented by the `payslips` table.
- Changes to the already-provisioned database schema in this UI task.

The schema source of truth for this feature is the user's provisioned schema:
`salary_structures` stores configuration and `payslips` stores generated
historical snapshots keyed by `profile_id`, year, and month.

## Architecture

Use a server component at `src/app/dashboard/payslip/page.tsx`:

1. Obtain the authenticated user through the existing server Supabase client.
2. Query only that user's rows from `payslips` using `profile_id = auth user id`.
3. Order periods newest first and select the requested valid period, or the
   newest row when no period is requested.
4. Pass a sanitized payslip view model to a server-rendered presentation
   component.

Use query parameters for period navigation, for example
`/dashboard/payslip?year=2026&month=8`. Invalid or unavailable periods fall
back to the newest available payslip and show a non-blocking selection state.

Do not expose `salary_structures`, formulas, or unneeded profile identifiers to
client components. No client component is required for the core payslip view.

## Data Model and View Model

Read these payslip columns only:

```ts
type PayslipRow = {
  id: string;
  profile_id: string;
  period_year: number;
  period_month: number;
  payable_days: number;
  base_salary: number;
  hra: number;
  allowances: Record<string, unknown>;
  gross_pay: number;
  deductions: number;
  net_pay: number;
  generated_at: string;
};
```

The page maps database rows to a sanitized view model. Allowances are rendered
only as finite numeric values with humanized labels. Unsupported JSON values
are omitted rather than stringified into the UI. Monetary amounts use
`Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })`.

The payslip view shows:

- Employee name and period label.
- Generated date.
- Payable days.
- Earnings: Base Salary, HRA, each numeric allowance, and Gross Pay.
- Deductions: aggregate Deductions.
- Net Pay as the prominent final amount.

No formulas or salary-structure percentages are shown. Since the schema only
stores aggregate deductions, the UI labels the value `Deductions` rather than
fabricating separate PF or tax values.

## UI Behavior

- Latest generated payslip is selected by default.
- A period selector lists available generated periods newest first.
- If no payslips exist, show an EmptyState explaining that a payslip has not
  been generated yet.
- If a requested period is unavailable, preserve the page and select the latest
  available period with a clear informational message.
- If the database query fails, show a generic error without raw database text.
- Use existing Builder 4 primitives: Card, Table or definition-list layout,
  Badge, Button, EmptyState, and Skeleton.
- Keep the layout readable on phone widths: stacked summary, earnings, and
  deductions sections; no horizontal overflow.
- Employee navigation includes Payslip. Admin navigation may also expose the
  route, but the page remains read-only unless a separate admin payroll scope
  is approved.

## Security

- Rely on the existing dashboard layout for authentication and redirect to
  `/login` when no profile/session exists.
- Query payslips by the authenticated user's profile ID only. Do not accept a
  profile ID from the URL.
- Do not select or render salary structures for employee payslip display.
- Do not send company IDs, Auth IDs, raw database rows, or formulas to client
  code.
- Respect the supplied RLS policies: employees read only their own payslips;
  admins retain their separately defined access.

## Verification

- Verify latest-period selection and explicit valid-period selection.
- Verify invalid and unavailable periods fall back safely.
- Verify empty, loading, and generic error states.
- Verify allowances with numeric values, non-numeric values, empty objects,
  and special characters in labels.
- Verify INR formatting and that no formulas are visible.
- Verify an employee cannot read another profile's payslip by changing query
  parameters or route values.
- Verify mobile layout and navigation.
- Run the repository's typecheck, lint, and build after upstream UI contracts
  and the payroll schema are available.
