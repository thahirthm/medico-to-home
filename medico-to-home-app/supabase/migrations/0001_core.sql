-- Medico To Home core schema. All access goes through the Node API, so RLS is
-- on for every table with no policies: the browser keys can read nothing.
create extension if not exists postgis with schema extensions;
create extension if not exists btree_gist with schema extensions;
set search_path = public, extensions;

create type user_role as enum ('patient', 'professional', 'admin');
create type professional_status as enum ('pending', 'live', 'hidden');
create type booking_status as enum ('pending_payment', 'confirmed', 'active', 'completed', 'cancelled');
create type visit_status as enum ('scheduled', 'accepted', 'on_the_way', 'arrived', 'in_session', 'completed', 'skipped', 'cancelled', 'no_show');
create type application_stage as enum ('documents', 'council', 'police', 'interview', 'approved', 'rejected');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null default '',
  phone text not null unique,
  email text not null default '',
  dob text not null default '',
  emergency_contact text not null default '',
  role user_role not null default 'patient',
  created_at timestamptz not null default now()
);

create table localities (
  id bigint generated always as identity primary key,
  name text not null unique,
  district text not null,
  pincode text not null,
  location geography(point, 4326) not null
);

create table categories (
  key text primary key,
  label text not null,
  one text not null,
  plural text not null,
  brand text not null,
  unit text not null,
  plan_default boolean not null default false,
  allow_plan boolean not null default false,
  mode text not null default 'session',
  registration_label text not null default '',
  sort_order int not null default 0
);

create table service_templates (
  id bigint generated always as identity primary key,
  category_key text not null references categories on delete cascade,
  name text not null,
  multiplier numeric(5,2) not null default 1,
  duration text not null default '45 min',
  sort_order int not null default 0
);

create table therapies (
  id text primary key,
  label text not null,
  category_key text not null references categories,
  brand text not null,
  helps text not null,
  steps text[] not null default '{}',
  plan text not null default '',
  sort_order int not null default 0
);

create table faqs (
  id bigint generated always as identity primary key,
  question text not null,
  answer text not null,
  sort_order int not null default 0
);

create table professionals (
  id text primary key default gen_random_uuid()::text,
  profile_id uuid unique references profiles on delete set null,
  name text not null,
  gender text not null default 'F',
  category_key text not null references categories,
  qualification text not null default '',
  experience_years int not null default 0,
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  locality_id bigint not null references localities,
  languages text[] not null default '{}',
  base_price int not null,
  radius_km int not null default 8,
  bio text not null default '',
  photo_url text not null default '',
  registration_no text not null default '',
  available_today_from text not null default '',
  status professional_status not null default 'pending',
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table patients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles on delete cascade,
  relation text not null default 'Me',
  name text not null,
  age text not null default '',
  gender text not null default '',
  blood_group text not null default '',
  height_cm text not null default '',
  weight_kg text not null default '',
  conditions jsonb not null default '[]',
  allergies jsonb not null default '[]',
  medications jsonb not null default '[]',
  history jsonb not null default '[]',
  share_records boolean not null default true,
  created_at timestamptz not null default now()
);
create index on patients (owner_id);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles on delete cascade,
  label text not null default 'Home',
  house text not null default '',
  street text not null default '',
  landmark text not null default '',
  locality text not null default '',
  pincode text not null default '',
  created_at timestamptz not null default now()
);
create index on addresses (owner_id);

create table bookings (
  id text primary key,
  owner_id uuid not null references profiles,
  patient_id uuid references patients on delete set null,
  patient_name text not null,
  professional_id text not null references professionals,
  service_name text not null,
  is_plan boolean not null default false,
  sessions int not null default 1,
  unit_paise bigint not null,
  subtotal_paise bigint not null,
  discount_paise bigint not null default 0,
  platform_fee_paise bigint not null,
  gst_paise bigint not null,
  total_paise bigint not null,
  status booking_status not null default 'confirmed',
  pay_method text not null default 'later',
  payment_status text not null default 'unpaid',
  address jsonb not null default '{}',
  notes text not null default '',
  share_records boolean not null default true,
  created_at timestamptz not null default now()
);
create index on bookings (owner_id);
create index on bookings (professional_id);

create table visits (
  id uuid primary key default gen_random_uuid(),
  booking_id text not null references bookings on delete cascade,
  professional_id text not null references professionals,
  sequence int not null default 1,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  blocked_until timestamptz not null,
  status visit_status not null default 'scheduled',
  notes text not null default '',
  eta_minutes int,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at and blocked_until >= ends_at),
  -- Makes double booking impossible, even for two simultaneous requests.
  exclude using gist (professional_id with =, tstzrange(starts_at, blocked_until) with &&)
    where (status not in ('skipped', 'cancelled', 'no_show'))
);
create index on visits (booking_id);

create table visit_events (
  id bigint generated always as identity primary key,
  visit_id uuid not null references visits on delete cascade,
  status visit_status not null,
  actor uuid references profiles on delete set null,
  created_at timestamptz not null default now()
);

create table reviews (
  id bigint generated always as identity primary key,
  professional_id text not null references professionals on delete cascade,
  visit_id uuid unique references visits on delete set null,
  author_name text not null,
  place text not null default '',
  stars int not null check (stars between 1 and 5),
  body text not null default '',
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index on reviews (professional_id);

create table medical_documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients on delete cascade,
  owner_id uuid not null references profiles on delete cascade,
  file_name text not null,
  storage_path text not null,
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);
create index on medical_documents (patient_id);

create table applications (
  id bigint generated always as identity primary key,
  name text not null,
  phone text not null,
  profession text not null,
  district text not null,
  registration_no text not null default '',
  stage application_stage not null default 'documents',
  created_at timestamptz not null default now()
);

create table payouts (
  id bigint generated always as identity primary key,
  professional_id text not null references professionals,
  week_start date not null,
  paid_at timestamptz not null default now(),
  amount_paise bigint not null,
  unique (professional_id, week_start)
);

create table audit_log (
  id bigint generated always as identity primary key,
  actor uuid,
  action text not null,
  subject text not null default '',
  created_at timestamptz not null default now()
);

do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' and tablename <> 'spatial_ref_sys' loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

insert into storage.buckets (id, name, public) values ('medical-documents', 'medical-documents', false)
  on conflict (id) do nothing;
