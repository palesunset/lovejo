-- Rollback storage policies and bucket

begin;

drop policy if exists "memory_photos_storage_select" on storage.objects;
drop policy if exists "memory_photos_storage_insert" on storage.objects;
drop policy if exists "memory_photos_storage_delete" on storage.objects;

delete from storage.buckets where id = 'memory-photos';

commit;
