-- =============================================================================
-- seed.sql — reference data (run after migrations)
-- Update allowed_users emails before running in production
-- =============================================================================

begin;

insert into public.allowed_users (email) values
  ('sariaruel@gmail.com'),
  ('jurenzjesfil.salvio@gmail.com')
on conflict (email) do nothing;

-- Book of Jo (fire) → jurenzjesfil.salvio@gmail.com (override with NEXT_PUBLIC_JO_EMAIL)
-- Book of Ru (ice)  → sariaruel@gmail.com (override with NEXT_PUBLIC_RU_EMAIL)

insert into public.books (id, title, description, cover_image) values
  (
    'a0000000-0000-4000-8000-000000000001',
    'Love, Jo',
    'Per Aspera',
    'fire'
  ),
  (
    'a0000000-0000-4000-8000-000000000002',
    'Love, Ru',
    'AD ASTRA',
    'ice'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  cover_image = excluded.cover_image;

insert into public.tags (name) values
  ('adventure'),
  ('travel'),
  ('food'),
  ('faith'),
  ('sunset'),
  ('roadtrip'),
  ('relationships'),
  ('firsts'),
  ('coffee'),
  ('memories'),
  ('summer'),
  ('beach'),
  ('cozy'),
  ('winter')
on conflict (name) do nothing;

commit;
