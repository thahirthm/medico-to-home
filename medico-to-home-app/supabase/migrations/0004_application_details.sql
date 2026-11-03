-- Full professional applications: profession-specific answers and uploaded documents.
-- Safe to run more than once.
set search_path = public, extensions;

alter table public.applications add column if not exists email text not null default '';
alter table public.applications add column if not exists gender text not null default '';
-- Answers keyed by the field keys in packages/shared/src/onboarding.ts.
alter table public.applications add column if not exists details jsonb not null default '{}';
-- [{ kind, fileName, path, size }] in the private medical-documents bucket, under applications/<profile id>/.
alter table public.applications add column if not exists documents jsonb not null default '[]';
alter table public.applications add column if not exists updated_at timestamptz not null default now();
