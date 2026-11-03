-- Login moves from mobile number to email. Mobile becomes an optional profile field.
alter table public.profiles drop constraint profiles_phone_key;
alter table public.profiles alter column phone drop not null;
create unique index profiles_phone_key on public.profiles (phone) where phone is not null and phone <> '';
create unique index auth_email_lookup_guard on public.profiles (lower(email)) where email <> '';
