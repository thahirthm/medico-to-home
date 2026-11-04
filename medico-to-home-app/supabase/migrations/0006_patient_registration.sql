-- Patient registration page: the language a patient would like their medico to speak.
-- Safe to run more than once.
alter table public.profiles add column if not exists preferred_language text not null default '';
