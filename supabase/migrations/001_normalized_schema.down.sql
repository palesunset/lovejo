-- =============================================================================
-- 001_normalized_schema.down.sql
-- Rollback for normalized schema (destructive — drops all app data)
-- =============================================================================

begin;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists memory_perspectives_updated_at on public.memory_perspectives;

drop function if exists public.handle_new_user();
drop function if exists public.set_perspective_updated_at();
drop function if exists public.is_allowed_user();

drop table if exists public.memory_tags cascade;
drop table if exists public.tags cascade;
drop table if exists public.memory_perspectives cascade;
drop table if exists public.memory_photos cascade;
drop table if exists public.memories cascade;
drop table if exists public.books cascade;
drop table if exists public.allowed_users cascade;
drop table if exists public.profiles cascade;

commit;
