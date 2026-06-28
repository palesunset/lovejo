-- =============================================================================
-- 004_performance_indexes.sql
-- Query-path indexes for search and tag batch lookups at scale.
--
-- Prerequisite: 001–003 migrations applied
-- =============================================================================

begin;

create extension if not exists pg_trgm;

-- Client-side search filters title/story/location
create index if not exists memories_title_trgm_idx
  on public.memories using gin (lower(title) gin_trgm_ops);

create index if not exists memories_story_trgm_idx
  on public.memories using gin (lower(story) gin_trgm_ops);

create index if not exists memories_location_trgm_idx
  on public.memories using gin (lower(coalesce(location, '')) gin_trgm_ops);

-- Tag batch resolution (.in('name', names))
create index if not exists tags_name_idx
  on public.tags (name);

commit;
