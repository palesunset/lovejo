-- Rollback 005_memory_timestamptz.sql (loses time-of-day)

begin;

alter table public.memories
  alter column memory_date type date
  using (memory_date at time zone 'Asia/Singapore')::date;

commit;
