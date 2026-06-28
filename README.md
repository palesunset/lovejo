# Our Story Board

A premium digital scrapbook for two people to preserve memories, adventures, photos, and stories together. Built to feel like opening a real leather-bound memory book — not social media.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (Auth, Database, Storage)
- **React PageFlip** (realistic page turning)
- **Framer Motion** (premium animations)
- **Lucide Icons**

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql`
3. Run the seed in `supabase/seed.sql` (update emails first)
4. Create a storage bucket named `memory-photos` (public)
5. Copy `.env.local.example` to `.env.local` and fill in your keys

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Supabase configured, the app runs with example data for preview.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage (wooden desk + books)
│   ├── book/[bookId]/      # Storybook view
│   ├── timeline/           # Chronological timeline
│   ├── login/              # Authentication
│   ├── profile/            # User profile
│   ├── search/             # Memory search
│   └── api/memories/       # Memory API
├── components/
│   ├── books/              # BookCover, BookShelf, StoryBook, BookPage
│   ├── memories/           # MemoryStamp, MemoryModal, AddMemoryModal
│   ├── timeline/           # TimelineView
│   ├── layout/             # NavigationBar, FAB, UserAvatar
│   └── ui/                 # Button, Modal
└── lib/
    ├── supabase/           # Client, server, middleware helpers
    ├── services/           # Memory data service
    ├── types/              # TypeScript types
    ├── validators/         # Zod schemas
    └── data/               # Example seed data
```

## Features

- **Homepage** — Realistic wooden desk with two leather-bound books
- **Storybook** — Page-flip navigation with memory stamps
- **Memory Stamps** — Postage-stamp style entries with expand animation
- **Dual Perspectives** — Both users can share their side of a memory
- **Timeline** — Chronological view grouped by year and month
- **Add Memory** — Photo upload, story, date, location, tags
- **Authentication** — Supabase Auth restricted to two invited users
- **Dark Mode** — Full theme support via next-themes

## Database

See [`supabase/README.md`](supabase/README.md) for migration instructions.

### Tables

```
profiles ──┬── memories (created_by)
           └── memory_perspectives (author_id)

books ── memories ──┬── memory_photos
                    ├── memory_perspectives
                    └── memory_tags → tags
```

- **profiles** — linked to Supabase Auth (`ON DELETE CASCADE`)
- **books** — title, description, cover_image
- **memories** — `memory_date` (date), `created_by` → profiles (`ON DELETE RESTRICT`)
- **memory_photos** — unlimited photos via `display_order` (`ON DELETE CASCADE`)
- **memory_perspectives** — one story per author per memory (`ON DELETE CASCADE`)
- **tags** + **memory_tags** — normalized M:N tagging
- **allowed_users** — two-user auth whitelist

### Migrations

```
supabase/migrations/
├── 001_normalized_schema.sql       # up
├── 001_normalized_schema.down.sql # rollback
├── 002_storage_policies.sql        # up
└── 002_storage_policies.down.sql   # rollback
```

## Design Tokens

| Token | Value |
|-------|-------|
| Warm Brown | `#5c3d2e` |
| Antique Gold | `#c9a962` |
| Cream Paper | `#f5f0e6` |
| Dark Navy | `#1e2a3a` |
| Muted Green | `#6b7f6b` |
| Soft Copper | `#b8734a` |

**Fonts:** Playfair Display (headings), Lora (body), Caveat (accent)
