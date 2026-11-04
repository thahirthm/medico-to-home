-- Dentists get their own catalogue category, listed right after Doctors, with home dental services.
-- Dentists approved before this were listed under Doctors; they move to the new category.
-- Safe to run more than once.
begin;

update public.categories set sort_order = sort_order + 1
where key <> 'doctor' and key <> 'dentist' and not exists (select 1 from public.categories where key = 'dentist');

insert into public.categories (key, label, one, plural, brand, unit, plan_default, allow_plan, mode, registration_label, sort_order)
values ('dentist', 'Dentists', 'Dentist', 'dentists', 'Dental', 'visit', false, true, 'session', 'Dental Council Reg. No.',
  coalesce((select sort_order + 1 from public.categories where key = 'doctor'), 1))
on conflict (key) do nothing;

insert into public.service_templates (category_key, name, multiplier, duration, sort_order)
select 'dentist', s.name, s.multiplier, s.duration, s.sort_order
from (values
  ('Dental check-up', 1.0, '30 min', 0),
  ('Toothache relief', 1.2, '45 min', 1),
  ('Scaling & cleaning', 1.5, '45 min', 2),
  ('Denture fitting & repair', 1.6, '60 min', 3),
  ('Oral care for bedridden patients', 1.3, '45 min', 4),
  ('Child dental check-up', 1.0, '30 min', 5)
) as s(name, multiplier, duration, sort_order)
where not exists (select 1 from public.service_templates where category_key = 'dentist');

update public.professionals p set category_key = 'dentist'
from public.applications a
where a.profile_id = p.profile_id and p.category_key = 'doctor' and a.details->>'kind' = 'medico' and a.details->'profile'->>'role' = 'Dentist';

commit;
