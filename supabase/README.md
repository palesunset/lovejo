# Supabase Migrations

Normalized relational schema for Our Story Board.

## Entity relationship

```
profiles ──┬── memories (created_by)
           └── memory_perspectives (author_id)

books ── memories ──┬── memory_photos      (1:N — unlimited photos)
                    ├── memory_perspectives (1:N — one row per author)
                    └── memory_tags ── tags (M:N junction)
```

## Apply migrations (fresh project)

Run in order in the **Supabase SQL Editor**:

| Order | File | Purpose |
|-------|------|---------|
| 1 | `migrations/001_normalized_schema.sql` | Tables, FKs, indexes, RLS, triggers |
| 2 | `migrations/002_storage_policies.sql` | `memory-photos` bucket + storage RLS |
| 3 | `migrations/003_public_read.sql` | Anonymous read access for books & memories |
| 4 | `migrations/004_performance_indexes.sql` | Search + tag lookup indexes |
| 5 | `seed.sql` | Books, tags, allowed users |

### Auth users (passwords)

SQL seed does **not** set passwords. After `seed.sql`, run once locally (passwords stay out of git):

```bash
# PowerShell — set password(s) for this run only
$env:SEED_JO_PASSWORD='your-jo-password'
node --env-file=.env.local supabase/seed-auth.mjs
```

Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (never commit). Optional: `SEED_RU_PASSWORD` for Ru.

Or use npm script (still pass `SEED_JO_PASSWORD` in the shell first):

```bash
npm run seed:auth
```

## Rollback

Run down migrations in **reverse order**:

1. `migrations/004_performance_indexes.down.sql`
2. `migrations/003_public_read.down.sql`
3. `migrations/002_storage_policies.down.sql`
4. `migrations/001_normalized_schema.down.sql`

## Design guarantees

| Requirement | Implementation |
|-------------|----------------|
| Multiple photos per memory | `memory_photos` rows with `display_order` |
| Multiple perspectives per memory | `memory_perspectives` rows; unique `(memory_id, author_id)` |
| Normalized tags | `tags` + `memory_tags` junction |
| Cascading deletes | `ON DELETE CASCADE` on all child → parent FKs |
| Profile integrity | `memories.created_by` uses `ON DELETE RESTRICT` |
| Case-insensitive tags | `tags.name` stored lowercase with CHECK constraint |

## TypeScript types

| File | Purpose |
|------|---------|
| `src/lib/types/database.ts` | Row, Insert, Update, Relationships |
| `src/lib/types/memory.ts` | Domain entities for UI/services |
| `src/lib/types/index.ts` | Re-exports |

## Regenerating types from Supabase CLI (optional)

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/types/database.generated.ts
```

Merge generated output with hand-maintained `MemoryWithRelations` join types in `database.ts`.
