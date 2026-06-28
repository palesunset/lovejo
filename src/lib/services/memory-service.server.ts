import type { Book, Memory } from "@/lib/types/memory";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils/supabase-config";
import {
  EXAMPLE_BOOKS,
  EXAMPLE_MEMORIES,
  getBookById,
  getMemoriesByBookId,
} from "@/lib/data/example-data";
import {
  MEMORY_SELECT,
  MEMORY_STAMP_SELECT,
  MEMORY_LIST_SELECT,
  mapRowToMemory,
  mapRowToMemoryStamp,
  mapRowToMemoryList,
  mapBookRow,
} from "@/lib/services/memory-mappers";
import type {
  MemoryListRow,
  MemoryStampRow,
} from "@/lib/services/memory-mappers";
import type { MemoryWithRelations } from "@/lib/types/database";

const BOOK_COLUMNS = "id, title, description, cover_image, created_at";

export async function fetchBooks(): Promise<Book[]> {
  if (!isSupabaseConfigured()) {
    return EXAMPLE_BOOKS;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(BOOK_COLUMNS)
    .order("created_at");

  if (error || !data) {
    return EXAMPLE_BOOKS;
  }

  return data.map((book, index) => mapBookRow(book, index));
}

export async function fetchBookById(bookId: string): Promise<Book | null> {
  if (!isSupabaseConfigured()) {
    return getBookById(bookId) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(BOOK_COLUMNS)
    .eq("id", bookId)
    .single();

  if (error || !data) {
    return getBookById(bookId) ?? null;
  }

  return mapBookRow(data, 0);
}

/** Stamp-level payload for flip-book grids — skips stories and perspectives. */
export async function fetchMemoriesByBookId(bookId: string): Promise<Memory[]> {
  if (!isSupabaseConfigured()) {
    return getMemoriesByBookId(bookId);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memories")
    .select(MEMORY_STAMP_SELECT)
    .eq("book_id", bookId)
    .order("memory_date", { ascending: true });

  if (error || !data) {
    return getMemoriesByBookId(bookId);
  }

  return (data as unknown as MemoryStampRow[]).map(mapRowToMemoryStamp);
}

/** List payload for timeline/search — full detail fetched in modal. */
export async function fetchAllMemories(): Promise<Memory[]> {
  if (!isSupabaseConfigured()) {
    return EXAMPLE_MEMORIES;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memories")
    .select(MEMORY_LIST_SELECT)
    .order("memory_date", { ascending: false });

  if (error || !data) {
    return EXAMPLE_MEMORIES;
  }

  return (data as unknown as MemoryListRow[]).map(mapRowToMemoryList);
}

export async function fetchMemoryById(id: string): Promise<Memory | null> {
  if (!isSupabaseConfigured()) {
    return EXAMPLE_MEMORIES.find((m) => m.id === id) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memories")
    .select(MEMORY_SELECT)
    .eq("id", id)
    .single();

  if (error || !data) {
    return EXAMPLE_MEMORIES.find((m) => m.id === id) ?? null;
  }

  return mapRowToMemory(data as unknown as MemoryWithRelations);
}
