-- ============ PAYROLL SCHEMA (PRD section 5.6) ============

create table public.salary_structures (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  base_salary numeric(12,2) not null,
  hra numeric(12,2) not null default 0,
  allowances jsonb not null default '{}'::jsonb,
  deduction_pct numeric(5,2) not null default 0,
  effective_from date not null default current_date,
  created_at timestamptz not null default now(),
  unique (profile_id, effective_from)
);

create table public.payslips (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  period_year int not null,
  period_month int not null check (period_month between 1 and 12),
  payable_days numeric(5,1) not null,
  base_salary numeric(12,2) not null,
  hra numeric(12,2) not null,
  allowances jsonb not null default '{}'::jsonb,
  gross_pay numeric(12,2) not null,
  deductions numeric(12,2) not null,
  net_pay numeric(12,2) not null,
  generated_at timestamptz not null default now(),
  unique (profile_id, period_year, period_month)
);

create index idx_salary_structure_profile on public.salary_structures(profile_id);
create index idx_payslips_profile on public.payslips(profile_id);
create index idx_payslips_company_period on public.payslips(company_id, period_year, period_month);

alter table public.salary_structures enable row level security;
alter table public.payslips enable row level security;

-- admin manages company-wide salary structures
create policy "admin manage salary structures" on public.salary_structures
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
      and p.company_id = salary_structures.company_id
    )
  );
-- employees read their own structure
create policy "employee read own salary" on public.salary_structures
  for select using (profile_id = auth.uid());

-- admin sees/manages all company payslips
create policy "admin manage payslips" on public.payslips
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
      and p.company_id = payslips.company_id
    )
  );
-- employees read own payslip
create policy "employee read own payslip" on public.payslips
  for select using (profile_id = auth.uid());
