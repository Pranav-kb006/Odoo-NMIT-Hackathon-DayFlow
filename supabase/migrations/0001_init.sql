# Dayflow schema — v1
# Full contract: docs/BACKEND_STRUCTURE.md (that file is the law; this is the SQL)

-- ============ companies ============
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  created_at timestamptz not null default now()
);

-- ============ profiles ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  full_name text not null,
  role text not null default 'employee' check (role in ('admin', 'employee')),
  department text,
  designation text,
  joined_on date,
  phone text,
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

-- ============ attendance ============
create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  work_date date not null default current_date,
  check_in timestamptz,
  check_out timestamptz,
  unique (user_id, work_date)
);

-- ============ leave_requests ============
create table public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  reason text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============ indexes ============
create index idx_profiles_company on public.profiles(company_id);
create index idx_attendance_company_date on public.attendance(company_id, work_date);
create index idx_leave_company_status on public.leave_requests(company_id, status);

-- ============ RLS ============
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.attendance enable row level security;
alter table public.leave_requests enable row level security;

-- companies: members can read their own company
create policy "read own company" on public.companies
  for select using (
    id = (select company_id from public.profiles where id = auth.uid())
  );

-- profiles: read everyone in your company; update only yourself (admins via service role/seed)
create policy "read company profiles" on public.profiles
  for select using (
    company_id = (select company_id from public.profiles where id = auth.uid())
  );
create policy "update own profile" on public.profiles
  for update using (id = auth.uid());

-- attendance: employees see own rows; admins see all company rows; users insert/update own
create policy "insert own attendance" on public.attendance
  for insert with check (
    user_id = auth.uid()
    and company_id = (select company_id from public.profiles where id = auth.uid())
  );
create policy "select attendance scoped" on public.attendance
  for select using (
    company_id = (select company_id from public.profiles where id = auth.uid())
    and (
      user_id = auth.uid()
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
    )
  );
create policy "update own attendance" on public.attendance
  for update using (user_id = auth.uid());

-- leave: employee CRUD own; admin reads all + reviews
create policy "insert own leave" on public.leave_requests
  for insert with check (
    user_id = auth.uid()
    and company_id = (select company_id from public.profiles where id = auth.uid())
  );
create policy "select leave scoped" on public.leave_requests
  for select using (
    company_id = (select company_id from public.profiles where id = auth.uid())
    and (
      user_id = auth.uid()
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
    )
  );
create policy "update own pending leave" on public.leave_requests
  for update using (
    user_id = auth.uid() and status = 'pending'
  );
create policy "admin review leave" on public.leave_requests
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
      and p.company_id = leave_requests.company_id
    )
  );
