-- Dayflow migration 0005 — leave request attachment column.
--
-- NOTE: the storage bucket used for leave attachments is the PRIVATE
-- `documents` bucket (created via API; policies live in 0006). This migration
-- only adds the column so historical DBs that predate it get it. The old
-- public `leave-attachments` bucket approach was dropped in favour of the
-- private `documents` bucket (employee medical certs must not be public).
--
-- Idempotent (IF NOT EXISTS) so it applies cleanly wherever pieces exist.

alter table public.leave_requests
  add column if not exists attachment_url text;
