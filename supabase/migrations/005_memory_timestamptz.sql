-- =============================================================================
-- 005_memory_timestamptz.sql
-- Store full memory timestamp (GMT+8) instead of date-only.
-- Existing dates are interpreted as midnight Asia/Singapore.
-- =============================================================================

begin;

alter table public.memories
  alter column memory_date type timestamptz
  using (
    (memory_date::text || ' 00:00:00')::timestamp at time zone 'Asia/Singapore'
  );

comment on column public.memories.memory_date is
  'When the memory happened (stored UTC; display in Asia/Singapore / GMT+8).';

commit;
