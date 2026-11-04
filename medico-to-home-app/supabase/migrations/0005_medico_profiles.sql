-- Medico registration: profile photos are public (they appear on the profile page),
-- unlike medical records and documents, which stay in the private bucket.
-- Safe to run more than once.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('medico-photos', 'medico-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- When the registration was sent, so a saved profile and a sent application can be told apart.
alter table public.applications add column if not exists submitted_at timestamptz;
update public.applications set submitted_at = created_at where submitted_at is null;

-- Professional mode's online switch: whether a professional is taking new requests right now.
alter table public.professionals add column if not exists online boolean not null default false;
