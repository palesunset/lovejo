import type { Memory, MemoryPerspective, MemoryPhoto } from "@/lib/types/memory";
import type { BookRow, MemoryWithRelations } from "@/lib/types/database";
import {
  getOwnerSlugForBookId,
  JO_BOOK_ID,
  RU_BOOK_ID,
  resolvePartnerDisplayName,
} from "@/lib/utils/book-owners";

export const MEMORY_SELECT = `
  *,
  memory_photos (image_url, storage_path, display_order),
  memory_tags (tag_id, tags (name)),
  memory_perspectives (story, author_id, created_at, updated_at, profiles:author_id (display_name, email)),
  profiles:created_by (display_name, email)
`;

/** Stamp grid — thumbnail + label only (book pages). */
export const MEMORY_STAMP_SELECT = `
  id,
  book_id,
  title,
  memory_date,
  created_by,
  memory_photos (image_url, display_order),
  profiles:created_by (display_name, email)
`;

/** Timeline / search lists — no photos or perspectives. */
export const MEMORY_LIST_SELECT = `
  id,
  book_id,
  title,
  story,
  memory_date,
  location,
  created_by,
  memory_tags (tag_id, tags (name)),
  profiles:created_by (display_name, email)
`;

export type MemoryStampRow = Pick<
  MemoryWithRelations,
  "id" | "book_id" | "title" | "memory_date" | "created_by" | "memory_photos" | "profiles"
>;

export type MemoryListRow = Pick<
  MemoryWithRelations,
  | "id"
  | "book_id"
  | "title"
  | "story"
  | "memory_date"
  | "location"
  | "created_by"
  | "memory_tags"
  | "profiles"
>;

function primaryPhotoUrl(
  photos: MemoryWithRelations["memory_photos"],
): string {
  const sorted = [...photos].sort((a, b) => a.display_order - b.display_order);
  return sorted[0]?.image_url ?? "/placeholder-memory.svg";
}

/** Maps stamp-select rows for book page grids. */
export function mapRowToMemoryStamp(row: MemoryStampRow): Memory {
  const photo = primaryPhotoUrl(row.memory_photos);

  return {
    id: row.id,
    bookId: row.book_id,
    title: row.title,
    story: "",
    date: row.memory_date,
    createdById: row.created_by,
    author: resolvePartnerDisplayName({
      email: row.profiles?.email,
      bookId: row.book_id,
      fallback: row.profiles?.display_name,
    }),
    photo,
    photos: [{ imageUrl: photo, displayOrder: 0 }],
    tags: [],
    perspectives: [],
  };
}

/** Maps list-select rows for timeline/search. Full detail loaded in modal. */
export function mapRowToMemoryList(row: MemoryListRow): Memory {
  const tags = row.memory_tags
    .map((t) => t.tags?.name)
    .filter((name): name is string => Boolean(name));

  return {
    id: row.id,
    bookId: row.book_id,
    title: row.title,
    story: row.story,
    location: row.location ?? undefined,
    date: row.memory_date,
    createdById: row.created_by,
    author: resolvePartnerDisplayName({
      email: row.profiles?.email,
      bookId: row.book_id,
      fallback: row.profiles?.display_name,
    }),
    photo: "/placeholder-memory.svg",
    photos: [],
    tags,
    perspectives: [],
  };
}

export function mapRowToMemory(row: MemoryWithRelations): Memory {
  const sortedPhotos = [...row.memory_photos].sort(
    (a, b) => a.display_order - b.display_order,
  );

  const photos: MemoryPhoto[] = sortedPhotos.map((p) => ({
    imageUrl: p.image_url,
    storagePath: p.storage_path ?? undefined,
    displayOrder: p.display_order,
  }));

  const perspectives: MemoryPerspective[] = row.memory_perspectives.map((p) => ({
    memoryId: row.id,
    authorId: p.author_id,
    author: resolvePartnerDisplayName({
      email: p.profiles?.email,
      bookId: row.book_id,
      fallback: p.profiles?.display_name,
    }),
    story: p.story,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));

  const tags = row.memory_tags
    .map((t) => t.tags?.name)
    .filter((name): name is string => Boolean(name));

  const primaryUrl = photos[0]?.imageUrl ?? "/placeholder-memory.svg";

  return {
    id: row.id,
    bookId: row.book_id,
    title: row.title,
    story: row.story,
    location: row.location ?? undefined,
    date: row.memory_date,
    createdById: row.created_by,
    author: resolvePartnerDisplayName({
      email: row.profiles?.email,
      bookId: row.book_id,
      fallback: row.profiles?.display_name,
    }),
    createdAt: row.created_at,
    photo: primaryUrl,
    photos,
    tags,
    perspectives,
  };
}

const BOOK_COVER_VARIANTS: Record<string, "fire" | "ice"> = {
  [JO_BOOK_ID]: "fire",
  [RU_BOOK_ID]: "ice",
};

function resolveCoverVariant(book: BookRow, index: number): "fire" | "ice" {
  if (book.cover_image === "fire" || book.cover_image === "ice") {
    return book.cover_image;
  }
  return BOOK_COVER_VARIANTS[book.id] ?? (index % 2 === 0 ? "fire" : "ice");
}

export function mapBookRow(book: BookRow, index = 0) {
  const variant = resolveCoverVariant(book, index);
  const coverImage =
    book.cover_image &&
    book.cover_image !== "fire" &&
    book.cover_image !== "ice"
      ? book.cover_image
      : undefined;

  return {
    id: book.id,
    title: book.title,
    description: book.description ?? undefined,
    coverImage,
    createdAt: book.created_at,
    coverVariant: variant,
    ownerSlug: getOwnerSlugForBookId(book.id),
  };
}

/** Normalize tag name for storage (lowercase per DB constraint) */
export function normalizeTagName(name: string): string {
  return name.trim().toLowerCase();
}
