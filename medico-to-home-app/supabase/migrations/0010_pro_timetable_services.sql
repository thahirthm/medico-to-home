-- A professional's own weekly timetable, service area and services with charges, filled in at registration.
-- weekly: { "Mon": ["8:00 AM", ...], ... }; services: [{ "name": "...", "price": 550, "duration": "30 min" }, ...].
-- Empty means "not set": the listing then falls back to the category's services and the demo slots.
-- Safe to run more than once.
alter table public.professionals add column if not exists weekly jsonb not null default '{}';
alter table public.professionals add column if not exists all_day boolean not null default false;
alter table public.professionals add column if not exists service_towns text[] not null default '{}';
alter table public.professionals add column if not exists services jsonb not null default '[]';
