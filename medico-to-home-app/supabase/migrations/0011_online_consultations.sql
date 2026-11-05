-- Online video consultations: a booking is either a home visit or an online consultation.
-- Online bookings have no address; the call's room is the booking id.
-- Safe to run more than once.
alter table public.bookings add column if not exists mode text not null default 'home';
do $$ begin
  alter table public.bookings add constraint bookings_mode_check check (mode in ('home', 'online'));
exception when duplicate_object then null; end $$;
