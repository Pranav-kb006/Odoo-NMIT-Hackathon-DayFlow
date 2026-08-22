-- Dayflow migration 0003 — email on profiles for the employee directory.
--
-- WHY: the directory UI (add/edit modal, CSV import, detail view) needs each
-- person's email. It lives in auth.users, which PostgREST cannot join to from
-- a regular request — so we mirror it onto profiles at creation time.
alter table public.profiles add column if not exists email text;