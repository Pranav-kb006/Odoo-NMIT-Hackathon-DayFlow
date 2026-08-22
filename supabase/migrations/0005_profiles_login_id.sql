-- Dayflow migration 0005 — real login_id on profiles.
--
-- PRD §login-format: {CompanyCode}{first2(FirstName)}{first2(LastName)}
-- {YearOfJoining}{4-digit serial}  e.g. DFJODO20260001
-- Company code comes from companies.code (2–4 letters chosen at signup).

alter table public.profiles add column if not exists login_id text;

-- backfill existing profiles from their name / joining year / company code.
-- row_number is computed in a CTE because window functions can't appear
-- directly in an UPDATE statement (SQLSTATE 42P20).
with numbered as (
  select id, row_number() over (partition by company_id order by created_at) as rn
  from public.profiles
)
update public.profiles p
set login_id =
  upper(c.code)
  || upper(substr(split_part(p.full_name, ' ', 1), 1, 2))
  || upper(substr(coalesce(NULLIF(split_part(p.full_name, ' ', 2), ''), 'X'), 1, 2))
  || to_char(p.joined_on, 'YYYY')
  || lpad(n.rn::text, 4, '0')
from public.companies c
join numbered n on n.id = p.id
where c.id = p.company_id
  and p.login_id is null;

create unique index if not exists idx_profiles_login_id on public.profiles(login_id);