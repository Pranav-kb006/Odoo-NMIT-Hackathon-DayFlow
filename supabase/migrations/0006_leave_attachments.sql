-- Dayflow migration 0006 — time-off document attachments.
--
-- 1) leave_requests.attachment_url: optional link to a file in the private
--    `documents` storage bucket (medical cert, etc.).
-- 2) Storage RLS for the `documents` bucket (private):
--      - any signed-in user may upload
--      - a user may read/download objects whose name is prefixed with their
--        own auth uid (we store at `<uid>/<file>`)
--      - admins in the same company may read any object in the bucket

alter table public.leave_requests
  add column if not exists attachment_url text;

-- ---- storage policies: documents bucket ----
create policy "documents authenticated upload"
  on storage.objects
  for insert
  with check (
    bucket_id = 'documents'
    and auth.role() = 'authenticated'
  );

create policy "documents owner read"
  on storage.objects
  for select
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "documents admin company read"
  on storage.objects
  for select
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
        and p.company_id = (
          select company_id from public.profiles
          where id = (storage.foldername(name))[1]::uuid
        )
    )
  );

create policy "documents owner delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
