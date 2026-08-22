-- Dayflow migration 0005 — leave request proof attachment.
--
-- WHY: employees must upload a supporting document when requesting leave.
-- The file is stored in the public `leave-attachments` storage bucket under
-- the uploader's own folder; its public URL is saved on the leave request so
-- admins can review the proof.
--
-- Idempotent (IF NOT EXISTS / OR REPLACE / ON CONFLICT) so this migration
-- applies cleanly to databases where pieces already exist.

alter table public.leave_requests add column if not exists attachment_url text;

-- Create the bucket idempotently via the storage schema.
insert into storage.buckets (id, name, public)
values ('leave-attachments', 'leave-attachments', true)
on conflict (id) do nothing;

-- Public read: anyone with the URL can view a submitted proof.
create or replace policy "leave attachments public read" on storage.objects
  for select using (bucket_id = 'leave-attachments');

-- Authenticated users may upload only under their own folder.
create or replace policy "leave attachments own upload" on storage.objects
  for insert with check (
    bucket_id = 'leave-attachments'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owners may update their own uploads.
create or replace policy "leave attachments owner update" on storage.objects
  for update using (
    bucket_id = 'leave-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owners may delete their own uploads.
create or replace policy "leave attachments owner delete" on storage.objects
  for delete using (
    bucket_id = 'leave-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );