-- Rollback 004_performance_indexes.sql

begin;

drop index if exists public.memories_title_trgm_idx;
drop index if exists public.memories_story_trgm_idx;
drop index if exists public.memories_location_trgm_idx;
drop index if exists public.tags_name_idx;

commit;
