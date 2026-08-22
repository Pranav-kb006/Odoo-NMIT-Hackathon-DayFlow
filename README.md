# Dayflow — HRMS

> Every workday, perfectly aligned.

**Dayflow** is a multi-tenant Human Resource Management System built for the
**Odoo × NMIT hackathon** by a 4-person team. It covers the core HR loop for a
company: employee directory, attendance, leave (with document attachments),
payroll, and per-role dashboards — all on Next.js 14 (App Router) + Supabase.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router), TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui design tokens |
| Backend | Supabase — Postgres, Auth, Storage, RLS |
| Validation | Zod (forms + API routes) |
| Deploy | Vercel |

## Features

- **Auth** — email/password signup (company created inline with optional logo),
  login, **forgot-password flow** (`/forgot-password` → email link →
  `/auth/confirm` → `/update-password`), and protected routes via middleware.
- **Employee Directory** — searchable list + detail view. Each employee gets a
  stable `login_id` in the format `{CompanyCode}{first2(first)}{first2(last)}{year}{serial}`
  (e.g. `ACMERAKU20250001`).
- **Attendance** — daily check-in/out tracking per employee.
- **Leave** — apply for leave with an **optional medical/attachment document**,
  stored privately in the Supabase `documents` bucket (signed URLs, owner +
  admin RLS). Approve/reject flow.
- **Payroll (real)** —
  - Admin sets each employee's salary structure (`base_salary`, HRA, allowances,
    deduction %).
  - **Generate Payslips** prorates each employee's wage by *payable days*
    (present attendance days + approved leave days) ÷ working days in the month,
    and writes real `payslips` rows. Employees without a configured salary are
    skipped (no fabricated rows).
  - The employee **profile → Salary Info** tab reads/writes the same
    `salary_structures` source, so payroll and profile stay in sync.
- **Dashboards** — admin and employee home views, including the employee's last
  12 months of payslips. The top status bar shows the **company logo** (falls
  back to the company name when none is set).

## Architecture

```
docs/                 PRD, backend structure, app flow, design, roles
supabase/migrations/ versioned schema (never hand-edited; replay in order)
src/app/              routes only — thin pages that compose components
  (auth)/             login, signup, forgot-password, update-password, confirm
  dashboard/          employees, attendance, leave, payroll, home
  api/                route handlers (employees, payslips, leave-requests, ...)
src/components/       ui/ = shared primitives; <domain>/ = feature components
src/lib/              supabase clients (browser/server/admin), auth, validation, payroll
scripts/              seed.mjs + e2e smoke tests
```

### Data model (key tables)

`companies` · `profiles` (user + employee record, `role` admin/employee,
`login_id`, `company_id`) · `attendance` · `leave_requests` (with
`attachment_url`) · `salary_structures` · `payslips`. Storage buckets:
`documents` (private — leave attachments + logos), `logos` (company logos).

### Auth model

- Browser client (`@/lib/supabase/client`) for interactive sessions.
- Server client (`@/lib/supabase/server`) for page data.
- Admin/service-role client (`@/lib/supabase/admin`) used **only** in trusted
  server actions (signup company creation, salary writes) to bypass RLS.
- Row Level Security enforces company isolation on every table.

## Quick Start

```bash
npm install
cp .env.example .env.local      # fill from the team vault / Supabase dashboard
# Apply the schema (replays supabase/migrations in order)
npx supabase db push            # or run the SQL files in supabase/migrations via the SQL editor
npm run db:seed                 # demo company (ACME) + employees + attendance
npm run dev                     # http://localhost:3000
```

> **Supabase Auth config:** set **Site URL** to your app origin (e.g.
> `http://localhost:3000`) so the password-reset email link lands on
> `/auth/confirm`. The reset template already uses that path.

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # server-only, never exposed to the client
```

## Demo Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@acme.test` | `Dayflow#2026` |
| Employee | `ravi@acme.test` | `Dayflow#2026` |

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | dev server |
| `npm run build` / `npm run start` | production build / serve |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run db:seed` | seed demo company + users + attendance |
| `npm run supabase:push` | apply migrations |

## Team

| Builder | Name | Domain |
|---|---|---|
| 1 | md | Lead / Auth + Integrations |
| 2 | Pranav | Attendance + Leave |
| 3 | Nithin | Employees + Directory |
| 4 | Lokaksha | Dashboard + Design System |

## License

MIT — hackathon code, do whatever.
