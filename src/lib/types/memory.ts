/**
 * Domain entities — application-facing types mapped from the database.
 * Separate from raw row types in database.ts to keep UI decoupled from schema.
 */

import type { BookOwnerSlug } from "@/lib/utils/book-owners";

export type { BookOwnerSlug };

export interface MemoryPerspective {
  id?: string;
  memoryId: string;
  authorId: string;
  author: string;
  story: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemoryPhoto {
  id?: string;
  imageUrl: string;
  storagePath?: string;
  displayOrder: number;
}

export interface Memory {
  id: string;
  bookId: string;
  title: string;
  story: string;
  location?: string;
  date: string;
  createdById: string;
  author: string;
  createdAt?: string;
  /** Primary photo URL for stamp thumbnail */
  photo: string;
  /** All photos, ordered by display_order */
  photos: MemoryPhoto[];
  tags: string[];
  perspectives: MemoryPerspective[];
}

export interface Book {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  createdAt?: string;
  /** UI theme when no custom cover image URL is set */
  coverVariant?: "fire" | "ice";
  /** Which partner owns this book */
  ownerSlug?: BookOwnerSlug;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface CreateMemoryInput {
  bookId: string;
  title: string;
  story: string;
  date: string;
  location?: string;
  tags?: string[];
  photos?: File[];
  perspective?: string;
}

/** Partial memory for list/stamp views */
export type MemorySummary = Pick<
  Memory,
  "id" | "title" | "photo" | "date" | "bookId"
>;
