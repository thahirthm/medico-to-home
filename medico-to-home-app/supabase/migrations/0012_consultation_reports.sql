-- Post-consultation reports: one per visit, written by the professional after a home visit or video consultation.
-- data holds the profession's structured fields (see packages/shared/src/reports.ts); summary is the written report.
-- Drafts are visible only to the professional; submitted reports appear in the patient's Consultation History.
-- Safe to run more than once.
create table if not exists public.consultation_reports (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null unique references public.visits on delete cascade,
  booking_id text not null references public.bookings on delete cascade,
  professional_id text not null references public.professionals,
  owner_id uuid references public.profiles on delete set null,
  patient_id uuid references public.patients on delete set null,
  category_key text not null,
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  data jsonb not null default '{}',
  summary text not null default '',
  summary_source text not null default '',
  attachments jsonb not null default '[]',
  consent boolean not null default false,
  signed_name text not null default '',
  signed_registration text not null default '',
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists consultation_reports_owner_idx on public.consultation_reports (owner_id, signed_at desc);
create index if not exists consultation_reports_professional_idx on public.consultation_reports (professional_id);
-- Reached only through the API, never directly from the browser.
alter table public.consultation_reports enable row level security;
