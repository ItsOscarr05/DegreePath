-- DegreePath MVP schema. Single source of truth for Supabase.
-- Apply via `supabase db push` (or paste into the SQL editor).

-- profiles: one row per authenticated user, linked to auth.users.
create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    university_id text not null,
    major_id text not null,
    minor_id text,
    catalog_year integer not null,
    expected_graduation_year integer,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create or replace function public.handle_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.handle_profiles_updated_at();

-- completed_courses: one row per (user, normalized course code).
create table if not exists public.completed_courses (
    user_id uuid not null references auth.users (id) on delete cascade,
    course_code text not null,
    credits numeric(4, 1) not null default 3,
    grade text,
    term text,
    created_at timestamptz not null default now(),
    primary key (user_id, course_code)
);

create index if not exists completed_courses_user_idx
    on public.completed_courses (user_id);

-- roadmap_snapshots: most recently generated plan per user (one current row).
create table if not exists public.roadmap_snapshots (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    payload jsonb not null,
    created_at timestamptz not null default now()
);

create index if not exists roadmap_snapshots_user_created_idx
    on public.roadmap_snapshots (user_id, created_at desc);

-- Row Level Security: each user only sees their own rows.
alter table public.profiles enable row level security;
alter table public.completed_courses enable row level security;
alter table public.roadmap_snapshots enable row level security;

drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "completed_courses read own" on public.completed_courses;
create policy "completed_courses read own" on public.completed_courses
  for select using (auth.uid() = user_id);

drop policy if exists "completed_courses insert own" on public.completed_courses;
create policy "completed_courses insert own" on public.completed_courses
  for insert with check (auth.uid() = user_id);

drop policy if exists "completed_courses update own" on public.completed_courses;
create policy "completed_courses update own" on public.completed_courses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "completed_courses delete own" on public.completed_courses;
create policy "completed_courses delete own" on public.completed_courses
  for delete using (auth.uid() = user_id);

drop policy if exists "roadmap_snapshots read own" on public.roadmap_snapshots;
create policy "roadmap_snapshots read own" on public.roadmap_snapshots
  for select using (auth.uid() = user_id);

drop policy if exists "roadmap_snapshots insert own" on public.roadmap_snapshots;
create policy "roadmap_snapshots insert own" on public.roadmap_snapshots
  for insert with check (auth.uid() = user_id);

drop policy if exists "roadmap_snapshots delete own" on public.roadmap_snapshots;
create policy "roadmap_snapshots delete own" on public.roadmap_snapshots
  for delete using (auth.uid() = user_id);
