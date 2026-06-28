-- Rollback 003_public_read.sql

begin;

drop policy if exists "books_select_public" on public.books;
drop policy if exists "memories_select_public" on public.memories;
drop policy if exists "memory_photos_select_public" on public.memory_photos;
drop policy if exists "memory_perspectives_select_public" on public.memory_perspectives;
drop policy if exists "tags_select_public" on public.tags;
drop policy if exists "memory_tags_select_public" on public.memory_tags;
drop policy if exists "profiles_select_public" on public.profiles;
drop policy if exists "memory_photos_storage_select_public" on storage.objects;

commit;
