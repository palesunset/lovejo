-- =============================================================================
-- 002_storage_policies.sql
-- Supabase Storage bucket and RLS for memory photo uploads
--
-- Prerequisite: run 001_normalized_schema.sql first
-- =============================================================================

begin;

-- Create bucket (idempotent via upsert pattern)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memory-photos',
  'memory-photos',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS
create policy "memory_photos_storage_select"
  on storage.objects for select to authenticated
  using (bucket_id = 'memory-photos' and public.is_allowed_user());

create policy "memory_photos_storage_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'memory-photos'
    and public.is_allowed_user()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "memory_photos_storage_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'memory-photos'
    and public.is_allowed_user()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

commit;
