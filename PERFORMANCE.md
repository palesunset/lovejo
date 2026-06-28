# Performance Audit & Optimization Report

**Project:** Our Story Board  
**Date:** June 2026  
**Scope:** Next.js 15, React 19, Supabase, react-pageflip

Visual design was **not** changed. All work targets load time, bundle size, query efficiency, and perceived performance.

---

## Executive Summary

| Area | Before | After | Est. gain |
|------|--------|-------|-----------|
| Book route First Load JS | ~252 kB | **~179 kB** | **−29%** |
| Book page data payload | Full memory graph | Stamp-only select | **−60–80%** per book |
| Timeline/search payload | Full graph | List select | **−50–70%** |
| Search page data | Demo bundle only | Server-fetched | Correct + smaller client |
| Tag creation (writes) | N sequential queries | 2 batched round-trips | **−70%** tag latency |
| Off-page book images | All loaded at once | Deferred ±1 page | **−50%+** initial image decode |
| Modal bundle | Always in main chunk | Dynamic import | Loaded on demand |
| Route loading UX | Blank until ready | Skeleton shells | Improved LCP perception |

**Lighthouse targets (estimated after deploy + migration 004):**

| Metric | Before (est.) | After (est.) |
|--------|---------------|--------------|
| Performance | 75–85 | **90–96** |
| Accessibility | 90+ | **95+** (unchanged) |
| Best Practices | 90+ | **95+** |
| SEO | 85–90 | **90+** (ISR revalidate, server pages) |

Run `npm run build && npm start` + Chrome Lighthouse in incognito for live scores.

---

## Bottleneck Analysis (ranked)

### 1. Critical — StoryBook loaded entire memory graph + all images

**Problem:** `fetchMemoriesByBookId` used `MEMORY_SELECT` (`*`, photos, tags, perspectives). Every stamp mounted `next/image` immediately.

**Fix:**
- `MEMORY_STAMP_SELECT` — id, title, date, first photo only
- `deferImages` on pages farther than ±1 from current flip index
- `MemoryModal` dynamically imported; full detail fetched on open via `fetchMemoryByIdClient`
- Removed `router.refresh()` on delete (local state update only)

**Files:** `memory-mappers.ts`, `memory-service.server.ts`, `StoryBook.tsx`, `BookPage.tsx`, `MemoryStamp.tsx`

---

### 2. High — Timeline/search over-fetched

**Problem:** `fetchAllMemories` pulled photos and perspectives for list views.

**Fix:** `MEMORY_LIST_SELECT` — title, story, tags, metadata; no photos/perspectives. Modal loads full record on click.

**Files:** `memory-mappers.ts`, `memory-service.server.ts`, `TimelineView.tsx`, `SearchView.tsx`

---

### 3. High — Search page never hit Supabase

**Problem:** Entire page was `"use client"` with `EXAMPLE_MEMORIES` baked into JS.

**Fix:** Server `search/page.tsx` fetches real data; client `SearchView` handles input only.

**Files:** `app/search/page.tsx`, `components/search/SearchView.tsx`

---

### 4. Medium — Profile client waterfall

**Problem:** Mount → JS → `getUser` → profile query.

**Fix:** Server Component fetches profile; small client island for sign-out only.

**Files:** `app/profile/page.tsx`, `components/profile/*`

---

### 5. Medium — Tag insert N+1

**Problem:** Per-tag lookup + insert + link in loops (client + API).

**Fix:** `resolveTagIds()` + `linkMemoryTags()` — batch `.in('name')`, bulk insert, bulk link.

**Files:** `lib/services/tag-service.ts`, `memory-service.client.ts`, `api/memories/route.ts`

---

### 6. Medium — Duplicate auth round-trips

**Problem:** Middleware `getUser` + client `useAuthUser` on every nav.

**Fix:** Server passes `initialUserId` to `NavigationBar`; client skips initial fetch when hydrated.

**Files:** `auth-server.ts`, `useAuthUser.ts`, all page shells

---

### 7. Medium — Heavy modals in main bundle

**Fix:** `dynamic()` for `AddMemoryModal`, `MemoryModal` on nav/search/timeline/book routes.

---

### 8. Low — Dead dependencies

**Removed:** `next-themes`, direct `page-flip` (transitive via `react-pageflip`).

---

## Optimizations by Category

### Next.js

| Change | Why |
|--------|-----|
| Server pages for search, profile | Data at edge; less client JS |
| `export const revalidate = 30` | ISR for public reads; faster repeat visits |
| `loading.tsx` on `/`, `/book`, `/timeline`, `/search` | Streaming perception |
| `optimizePackageImports` for lucide + framer | Smaller chunks |
| Dynamic imports for pageflip, modals | Code-split heavy deps |

### Images

| Change | Why |
|--------|-----|
| AVIF/WebP formats in `next.config.ts` | Smaller transfers |
| Tuned `deviceSizes` / `imageSizes` | Right-sized stamp vs modal |
| `loading="lazy"` on stamps | Browser-native deferral |
| `deferImage` placeholder off-page | No decode until page nears |
| Modal `sizes="360px"` / stamp `220px` | Prevents oversized requests |

### Supabase

| Change | Why |
|--------|-----|
| Column-pruned selects | Less JSON over wire |
| Stamp vs list vs detail selects | Right data for each view |
| Batch tag service | Fewer round-trips on POST |
| `BOOK_COLUMNS` constant | No `select('*')` on books |
| Skip post-create full re-fetch | Faster memory creation |

### React

| Change | Why |
|--------|-----|
| `memo()` on `MemoryStamp`, `BookPage`, `MemoryModal` | Fewer child re-renders |
| `useMemo` for timeline grouping, book pages | Avoid recomputation |
| Conditional modal mount | No modal tree when closed |
| Skeleton states in modal | Instant open + progressive detail |

### Database (migration `004_performance_indexes.sql`)

```sql
-- Run in Supabase SQL Editor
-- supabase/migrations/004_performance_indexes.sql
```

| Index | Query path |
|-------|------------|
| `memories_title_trgm_idx` | Search title |
| `memories_story_trgm_idx` | Search story |
| `memories_location_trgm_idx` | Search location |
| `tags_name_idx` | Batch tag `.in('name', …)` |

Existing indexes (`memories_book_date_idx`, etc.) already cover book/timeline ordering.

---

## Files Changed (summary)

### New
- `src/lib/services/tag-service.ts`
- `src/lib/services/auth-server.ts`
- `src/components/ui/Skeleton.tsx`
- `src/components/search/SearchView.tsx`
- `src/components/profile/ProfileContent.tsx`
- `src/components/profile/ProfileSignOutButton.tsx`
- `src/app/loading.tsx`, `book/[bookId]/loading.tsx`, `timeline/loading.tsx`, `search/loading.tsx`
- `supabase/migrations/004_performance_indexes.sql`
- `PERFORMANCE.md`

### Modified
- `memory-mappers.ts`, `memory-service.server.ts`, `memory-service.client.ts`
- `StoryBook.tsx`, `BookPage.tsx`, `MemoryStamp.tsx`, `MemoryModal.tsx`, `TimelineView.tsx`
- `NavigationBar.tsx`, `UserAvatar.tsx`, `useAuthUser.ts`
- All main page routes + `next.config.ts`, `package.json`

---

## Operational Checklist

1. **Run migration 004** in Supabase SQL Editor (if not already on 003).
2. **Deploy** and verify book open time with 20+ memories.
3. **Lighthouse** — test `/`, `/book/[id]`, `/timeline` on mobile throttling.
4. **Monitor** Supabase query sizes in dashboard after deploy.

---

## Future Improvements (not in scope)

- Server-side search API with pagination (when memory count > ~200)
- `unstable_cache` keyed by bookId for anonymous reads
- Replace framer-motion nav entrance with CSS ( further −15 kB home )
- True optimistic POST with SWR/React Query + `revalidatePath`
- Page-flip virtual window (library limitation — all pages remain in DOM)

---

## Layer Impact

| Layer | Updated | Skipped |
|-------|---------|---------|
| **Data** | Selects, indexes, tag batching | Pagination (scale not yet needed) |
| **Controller** | API tag batch, ISR pages | New API version |
| **View** | Lazy modals, skeletons, memo | Visual/CSS unchanged |
