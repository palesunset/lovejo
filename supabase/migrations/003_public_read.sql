-- =============================================================================
-- 003_public_read.sql
-- Allow anonymous visitors to read books and memories; writes stay authenticated.
--
-- Prerequisite: 001_normalized_schema.sql, 002_storage_policies.sql
-- =============================================================================

begin;

-- books
create policy "books_select_public"
  on public.books for select to anon
  using (true);

-- memories
create policy "memories_select_public"
  on public.memories for select to anon
  using (true);

-- memory_photos
create policy "memory_photos_select_public"
  on public.memory_photos for select to anon
  using (true);

-- memory_perspectives
create policy "memory_perspectives_select_public"
  on public.memory_perspectives for select to anon
  using (true);

-- tags
create policy "tags_select_public"
  on public.tags for select to anon
  using (true);

-- memory_tags
create policy "memory_tags_select_public"
  on public.memory_tags for select to anon
  using (true);

-- profiles: only whitelisted partner accounts (for author display names)
create policy "profiles_select_public"
  on public.profiles for select to anon
  using (
    exists (
      select 1
      from public.allowed_users au
      where lower(au.email) = lower(profiles.email)
    )
  );

-- storage: public bucket reads for photo URLs
create policy "memory_photos_storage_select_public"
  on storage.objects for select to anon
  using (bucket_id = 'memory-photos');

commit;
