-- =============================================================================
-- 001_normalized_schema.sql
-- Normalized relational schema for Our Story Board
--
-- Entity graph:
--   profiles ──┬── memories (created_by)
--              └── memory_perspectives (author_id)
--
--   books ── memories ──┬── memory_photos   (1:N, unlimited photos)
--                       ├── memory_perspectives (1:N, one row per author)
--                       └── memory_tags ── tags
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

-- Profiles: 1:1 with auth.users
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  constraint profiles_email_not_empty check (length(trim(email)) > 0),
  constraint profiles_display_name_not_empty check (length(trim(display_name)) > 0),
  constraint profiles_email_unique unique (email)
);

-- Auth gate: only whitelisted emails may register
create table public.allowed_users (
  email text primary key,
  created_at timestamptz not null default now(),
  constraint allowed_users_email_not_empty check (length(trim(email)) > 0)
);

-- Books: top-level collections on the shelf
create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_image text,
  created_at timestamptz not null default now(),
  constraint books_title_not_empty check (length(trim(title)) > 0)
);

-- Memories: scrapbook entries belonging to a book
create table public.memories (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id) on delete cascade,
  title text not null,
  story text not null default '',
  location text,
  memory_date date not null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint memories_title_not_empty check (length(trim(title)) > 0)
);

-- Photos: unlimited photos per memory, ordered by display_order
create table public.memory_photos (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories (id) on delete cascade,
  image_url text not null,
  storage_path text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint memory_photos_image_url_not_empty check (length(trim(image_url)) > 0),
  constraint memory_photos_display_order_non_negative check (display_order >= 0),
  constraint memory_photos_memory_display_order_unique unique (memory_id, display_order)
);

-- Perspectives: each author contributes at most one story per memory (scales to N users)
create table public.memory_perspectives (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  story text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memory_perspectives_story_not_empty check (length(trim(story)) > 0),
  constraint memory_perspectives_one_per_author unique (memory_id, author_id)
);

-- Tags: normalized vocabulary (names stored lowercase for case-insensitive uniqueness)
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  constraint tags_name_not_empty check (length(trim(name)) > 0),
  constraint tags_name_lowercase check (name = lower(trim(name))),
  constraint tags_name_unique unique (name)
);

-- Memory ↔ Tag junction (M:N)
create table public.memory_tags (
  memory_id uuid not null references public.memories (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (memory_id, tag_id)
);

-- -----------------------------------------------------------------------------
-- Indexes (query paths)
-- -----------------------------------------------------------------------------

create index books_created_at_idx on public.books (created_at asc);

create index memories_book_id_idx on public.memories (book_id);
create index memories_memory_date_idx on public.memories (memory_date desc);
create index memories_created_by_idx on public.memories (created_by);
create index memories_book_date_idx on public.memories (book_id, memory_date desc);

create index memory_photos_memory_id_idx on public.memory_photos (memory_id);
create index memory_photos_memory_order_idx on public.memory_photos (memory_id, display_order asc);

create index memory_perspectives_memory_id_idx on public.memory_perspectives (memory_id);
create index memory_perspectives_author_id_idx on public.memory_perspectives (author_id);

create index memory_tags_memory_id_idx on public.memory_tags (memory_id);
create index memory_tags_tag_id_idx on public.memory_tags (tag_id);

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.allowed_users where email = new.email
  ) then
    raise exception 'Registration is not allowed for this email';
  end if;

  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_perspective_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger memory_perspectives_updated_at
  before update on public.memory_perspectives
  for each row execute function public.set_perspective_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security helper
-- -----------------------------------------------------------------------------

create or replace function public.is_allowed_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.allowed_users au
    join public.profiles p on p.email = au.email
    where p.id = auth.uid()
  );
$$;

-- -----------------------------------------------------------------------------
-- Enable RLS
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.allowed_users enable row level security;
alter table public.books enable row level security;
alter table public.memories enable row level security;
alter table public.memory_photos enable row level security;
alter table public.memory_perspectives enable row level security;
alter table public.tags enable row level security;
alter table public.memory_tags enable row level security;

-- -----------------------------------------------------------------------------
-- RLS Policies
-- -----------------------------------------------------------------------------

-- profiles
create policy "profiles_select_allowed"
  on public.profiles for select to authenticated
  using (public.is_allowed_user());

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = auth.uid() and public.is_allowed_user())
  with check (id = auth.uid() and public.is_allowed_user());

-- allowed_users
create policy "allowed_users_select"
  on public.allowed_users for select to authenticated
  using (public.is_allowed_user());

-- books
create policy "books_select_allowed"
  on public.books for select to authenticated
  using (public.is_allowed_user());

-- memories
create policy "memories_select_allowed"
  on public.memories for select to authenticated
  using (public.is_allowed_user());

create policy "memories_insert_own"
  on public.memories for insert to authenticated
  with check (public.is_allowed_user() and created_by = auth.uid());

create policy "memories_update_own"
  on public.memories for update to authenticated
  using (public.is_allowed_user() and created_by = auth.uid())
  with check (public.is_allowed_user() and created_by = auth.uid());

create policy "memories_delete_own"
  on public.memories for delete to authenticated
  using (public.is_allowed_user() and created_by = auth.uid());

-- memory_photos (any allowed user may attach photos to shared memories)
create policy "memory_photos_select_allowed"
  on public.memory_photos for select to authenticated
  using (public.is_allowed_user());

create policy "memory_photos_insert_allowed"
  on public.memory_photos for insert to authenticated
  with check (public.is_allowed_user());

create policy "memory_photos_update_allowed"
  on public.memory_photos for update to authenticated
  using (public.is_allowed_user())
  with check (public.is_allowed_user());

create policy "memory_photos_delete_allowed"
  on public.memory_photos for delete to authenticated
  using (public.is_allowed_user());

-- memory_perspectives
create policy "memory_perspectives_select_allowed"
  on public.memory_perspectives for select to authenticated
  using (public.is_allowed_user());

create policy "memory_perspectives_insert_own"
  on public.memory_perspectives for insert to authenticated
  with check (public.is_allowed_user() and author_id = auth.uid());

create policy "memory_perspectives_update_own"
  on public.memory_perspectives for update to authenticated
  using (public.is_allowed_user() and author_id = auth.uid())
  with check (public.is_allowed_user() and author_id = auth.uid());

create policy "memory_perspectives_delete_own"
  on public.memory_perspectives for delete to authenticated
  using (public.is_allowed_user() and author_id = auth.uid());

-- tags
create policy "tags_select_allowed"
  on public.tags for select to authenticated
  using (public.is_allowed_user());

create policy "tags_insert_allowed"
  on public.tags for insert to authenticated
  with check (public.is_allowed_user());

-- memory_tags
create policy "memory_tags_select_allowed"
  on public.memory_tags for select to authenticated
  using (public.is_allowed_user());

create policy "memory_tags_insert_allowed"
  on public.memory_tags for insert to authenticated
  with check (public.is_allowed_user());

create policy "memory_tags_delete_allowed"
  on public.memory_tags for delete to authenticated
  using (public.is_allowed_user());

commit;
