-- Dayflow migration 0002 — fix FK targets so PostgREST can embed profiles.
--
-- WHY: leave_requests.user_id / attendance.user_id pointed at auth.users(id),
-- but profiles is a 1:1 map over auth.users (profiles.id = auth user id). The
-- app embeds the requester's profile via `profiles:user_id`, which PostgREST
-- can only resolve if user_id is an FK directly on public.profiles(id).
-- Pointing at auth.users made every admin list/approve call die with
-- "Could not find a relationship between 'leave_requests' and 'user_id'".
--
-- Data-safe: profiles.id already equals the auth user id, so re-pointing the
-- FK changes the relationship metadata, not the stored UUIDs.

alter table public.leave_requests
  drop constraint if exists leave_requests_user_id_fkey,
  add constraint leave_requests_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade;

alter table public.attendance
  drop constraint if exists attendance_user_id_fkey,
  add constraint attendance_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade;