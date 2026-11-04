-- Admins can delete a user's account. Past bookings stay for the professional's earnings and payouts,
-- but no longer point at the deleted account. Safe to run more than once.
alter table public.bookings alter column owner_id drop not null;
alter table public.bookings drop constraint if exists bookings_owner_id_fkey;
alter table public.bookings add constraint bookings_owner_id_fkey foreign key (owner_id) references public.profiles (id) on delete set null;
