-- One account for patients and professionals; staff roles for the admin dashboard.
-- Safe to run more than once.
set search_path = public, extensions;

-- Sign-up details asked for on first sign-in.
alter table public.profiles add column if not exists city text not null default '';
alter table public.profiles add column if not exists terms_accepted_at timestamptz;
-- 'patient' or 'professional': the mode the account opens in next time.
alter table public.profiles add column if not exists last_mode text not null default 'patient';
-- Admin modules this staff member may open. Only used when role = 'admin'.
alter table public.profiles add column if not exists staff_roles text[] not null default '{}';

-- Accounts made before this change already agreed when they signed up.
update public.profiles set terms_accepted_at = created_at where terms_accepted_at is null and full_name <> '';
-- Existing admins keep full access.
update public.profiles set staff_roles = '{super_admin}' where role = 'admin' and staff_roles = '{}';

-- Applications now belong to the signed-in account that sent them.
alter table public.applications add column if not exists profile_id uuid references public.profiles on delete set null;
alter table public.applications add column if not exists decision_note text not null default '';
create index if not exists applications_profile_id_idx on public.applications (profile_id);
alter type application_stage add value if not exists 'info_needed';

-- Who did what in the admin dashboard.
create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);
