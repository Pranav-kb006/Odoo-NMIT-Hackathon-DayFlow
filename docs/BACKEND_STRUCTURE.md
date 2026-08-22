# BACKEND_STRUCTURE.md — Dayflow

Supabase (Postgres + Auth + Storage). Every table except `companies` is scoped by `company_id` and locked down with Row Level Security — this is a multi-tenant app, so RLS is not optional, it's the tenant boundary.

## 1. Auth Model
- Supabase Auth handles credentials (email/password). `auth.users.id` is the source of truth for identity; our `users` table extends it 1:1 via an `auth_id` FK.
- Employees never call Supabase Auth's public signup. Admin creates the `auth.users` row **server-side** (service role, in an API route) with a system-generated temp password, then inserts the matching `users` row.
- `role` lives on our `users` table (not just Auth metadata) — RLS reads it via a `current_user_role()` helper so it can't be spoofed from the client.
- Employee is forced to change temp password on first login (`must_change_password`).

## 2. Schema

```sql
-- Companies (tenants)
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_code text not null unique,        -- e.g. "DF", used in login ID generation
  logo_url text,
  working_days_per_week int not null default 5,
  break_time_minutes int not null default 60,
  created_at timestamptz not null default now()
);

-- Users (both admin and employee rows live here)
create table users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  role text not null check (role in ('admin', 'employee')),
  login_id text not null unique,            -- e.g. DFJODO20260001
  first_name text not null,
  last_name text not null,
  personal_email text,
  work_email text not null,
  mobile text,
  department text,
  job_position text,
  manager_id uuid references users(id),
  location text,
  date_of_joining date not null default current_date,
  about text,
  skills text[],
  avatar_url text,
  must_change_password boolean not null default true,
  created_at timestamptz not null default now()
);

-- Private info (split from users — tighter RLS, fewer eyes on it)
create table user_private_info (
  user_id uuid primary key references users(id) on delete cascade,
  date_of_birth date,
  residing_address text,
  gender text,
  nationality text,
  marital_status text,
  bank_account_number text,
  bank_name text,
  ifsc_code text,
  pan_no text,
  uan_no text
);

-- Resume / document uploads
create table user_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  company_id uuid not null references companies(id),
  doc_type text not null check (doc_type in ('resume', 'certification', 'other')),
  file_url text not null,
  file_size_bytes int not null check (file_size_bytes <= 5242880), -- 5MB
  uploaded_at timestamptz not null default now()
);

-- Attendance
create table attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  company_id uuid not null references companies(id),
  work_date date not null,
  check_in timestamptz,
  check_out timestamptz,
  status text not null default 'present'
    check (status in ('present', 'absent', 'half_day', 'leave')),
  unique (user_id, work_date)
);

-- Leave balances (per employee, per type; v1: seeded flat)
create table leave_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  company_id uuid not null references companies(id),
  leave_type text not null check (leave_type in ('paid', 'sick', 'unpaid')),
  days_available numeric not null default 0,
  unique (user_id, leave_type)
);

-- Leave requests
create table leave_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  company_id uuid not null references companies(id),
  leave_type text not null check (leave_type in ('paid', 'sick', 'unpaid')),
  start_date date not null,
  end_date date not null,
  days_requested numeric not null,
  attachment_url text,   -- expected for sick leave, NOT enforced server-side in v1
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewer_id uuid references users(id),
  reviewer_comment text,
  created_at timestamptz not null default now()
);

-- Salary configuration (Admin-only visibility, drives payslip calc)
create table salary_config (
  user_id uuid primary key references users(id) on delete cascade,
  company_id uuid not null references companies(id),
  monthly_wage numeric not null,
  basic_pct numeric not null default 50,          -- % of wage
  hra_pct numeric not null default 50,            -- % of basic
  standard_allowance numeric not null default 4167, -- flat
  performance_bonus_pct numeric not null default 8.33,  -- % of basic
  lta_pct numeric not null default 8.333,         -- % of basic
  pf_employee_pct numeric not null default 12,    -- % of basic
  pf_employer_pct numeric not null default 12,    -- % of basic
  professional_tax numeric not null default 200,  -- flat
  updated_at timestamptz not null default now()
);

-- Payslips (generated snapshot — don't recompute historical months live)
create table payslips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  company_id uuid not null references companies(id),
  period_month int not null,
  period_year int not null,
  payable_days numeric not null,
  basic numeric not null,
  hra numeric not null,
  standard_allowance numeric not null,
  performance_bonus numeric not null,
  lta numeric not null,
  fixed_allowance numeric not null,
  gross_pay numeric not null,
  pf_deduction numeric not null,
  professional_tax numeric not null,
  net_pay numeric not null,
  generated_at timestamptz not null default now(),
  unique (user_id, period_month, period_year)
);
```

## 3. Salary Calculation Logic (server-side function, not client)

Given `monthly_wage`:
1. `basic = wage * (basic_pct / 100)`
2. `hra = basic * (hra_pct / 100)`
3. `performance_bonus = basic * (performance_bonus_pct / 100)`
4. `lta = basic * (lta_pct / 100)`
5. `standard_allowance` = flat value from config
6. `fixed_allowance = wage − (basic + hra + standard_allowance + bonus + lta)` — reject save if negative
7. `gross_pay = basic + hra + standard_allowance + bonus + lta + fixed_allowance` (== wage)
8. `pf_deduction = basic * (pf_employee_pct / 100)`
9. `net_pay = gross_pay − pf_deduction − professional_tax`
10. `payable_days` = working days in period − unpaid-leave/absent days from attendance + leave_requests; scale net_pay proportionally if payable_days < total_working_days.

Runs in a Postgres function or a server-only API route — never trust a client-submitted `net_pay`.

## 4. Row Level Security (the tenant boundary — do not skip)

```sql
-- Helpers: current user's company_id and role
create or replace function current_user_company() returns uuid as $$
  select company_id from users where auth_id = auth.uid();
$$ language sql stable security definer;

create or replace function current_user_role() returns text as $$
  select role from users where auth_id = auth.uid();
$$ language sql stable security definer;

alter table companies         enable row level security;
alter table users             enable row level security;
alter table user_private_info enable row level security;
alter table user_documents    enable row level security;
alter table attendance        enable row level security;
alter table leave_balances    enable row level security;
alter table leave_requests    enable row level security;
alter table salary_config     enable row level security;
alter table payslips          enable row level security;

-- users: everyone in a company can see co-workers' basic rows; only self or admin updates
create policy users_select on users for select
  using (company_id = current_user_company());
create policy users_update on users for update
  using (auth_id = auth.uid() or current_user_role() = 'admin');

-- private info: self or admin only — never a bare company-wide select
create policy private_info_rw on user_private_info for all using (
  user_id = (select id from users where auth_id = auth.uid())
  or current_user_role() = 'admin'
);

-- attendance: self read/write own; admin read all in company
create policy attendance_self on attendance for all
  using (user_id = (select id from users where auth_id = auth.uid()));
create policy attendance_admin on attendance for select
  using (company_id = current_user_company() and current_user_role() = 'admin');

-- leave_requests: self create/read own; admin read + update (approve/reject) all
create policy leave_self_rw on leave_requests for all
  using (user_id = (select id from users where auth_id = auth.uid()));
create policy leave_admin_rw on leave_requests for all
  using (company_id = current_user_company() and current_user_role() = 'admin');

-- salary_config: ADMIN ONLY, full stop — no employee select policy at all
create policy salary_config_admin_only on salary_config for all
  using (company_id = current_user_company() and current_user_role() = 'admin');

-- payslips: self read own (final numbers only); admin read/write all
create policy payslip_self_select on payslips for select
  using (user_id = (select id from users where auth_id = auth.uid()));
create policy payslip_admin_rw on payslips for all
  using (company_id = current_user_company() and current_user_role() = 'admin');
```

## 5. Key API Routes (`src/app/api/`)

| Route | Method | Access | Purpose |
|---|---|---|---|
| `/api/company/signup` | POST | Public | Create company + first admin (service role) |
| `/api/employees` | POST | Admin | Create employee: generate login_id, temp password via service role |
| `/api/employees/[id]` | PATCH | Admin or self (limited fields) | Update profile |
| `/api/attendance/checkin` | POST | Employee | Upsert today's `attendance.check_in` |
| `/api/attendance/checkout` | POST | Employee | Update today's `attendance.check_out` |
| `/api/leave-requests` | POST | Employee | Create a leave request |
| `/api/leave-requests/[id]/review` | PATCH | Admin | Approve/reject, adjust `leave_balances` on approve |
| `/api/salary-config/[userId]` | GET/PUT | Admin only | Read/update wage + components |
| `/api/payslips/generate` | POST | Admin | Run §3 calc for a period, insert into `payslips` |
| `/api/payslips/[userId]` | GET | Self or Admin | Read generated payslip rows |

## 6. Storage Rules
- Bucket `avatars` — public read; write restricted to owning user or admin of their company.
- Bucket `documents` — private, signed URLs only; 5MB limit enforced client-side (UX) AND via `file_size_bytes` check constraint.
- Bucket `logos` — public read; write restricted to that company's admin.

## 7. Edge Cases
- Duplicate check-in same day → upsert on `(user_id, work_date)`, don't error.
- Leave spanning weekends → v1 counts calendar days (documented non-goal).
- Salary save where `fixed_allowance < 0` → reject with clear error, no silent clamping.
- Employee deletion → soft-delete only (`deactivated_at` column if time permits). Never hard-delete a `users` row with attendance/payroll history.
