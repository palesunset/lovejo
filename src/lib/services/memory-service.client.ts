import type { Memory } from "@/lib/types/memory";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  MEMORY_SELECT,
  mapRowToMemory,
} from "@/lib/services/memory-mappers";
import { linkMemoryTags, resolveTagIds } from "@/lib/services/tag-service";
import type { MemoryWithRelations } from "@/lib/types/database";
import { db } from "@/lib/db/repositories";
import { getBookIdForEmail } from "@/lib/utils/book-owners";
import {
  compressImageForUpload,
  MAX_UPLOAD_BYTES,
} from "@/lib/utils/image-compress";

export interface UploadedPhoto {
  imageUrl: string;
  storagePath: string;
}

function mapUploadError(message: string): string {
  if (message.toLowerCase().includes("maximum allowed size")) {
    return `Photo exceeds the ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB upload limit. Try a smaller image.`;
  }
  return message;
}

export async function uploadMemoryPhoto(
  file: File,
  userId: string,
): Promise<UploadedPhoto> {
  const supabase = createClient();
  const prepared = await compressImageForUpload(file);
  const storagePath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("memory-photos")
    .upload(storagePath, prepared, {
      cacheControl: "3600",
      upsert: false,
      contentType: prepared.type,
    });

  if (uploadError) {
    throw new Error(mapUploadError(uploadError.message));
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("memory-photos").getPublicUrl(storagePath);

  return { imageUrl: publicUrl, storagePath };
}

export async function fetchMemoryByIdClient(id: string): Promise<Memory | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("memories")
    .select(MEMORY_SELECT)
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return mapRowToMemory(data as unknown as MemoryWithRelations);
}

export async function createMemory(
  input: {
    bookId: string;
    title: string;
    story: string;
    date: string;
    location?: string;
    tags?: string[];
    photos?: UploadedPhoto[];
    perspective?: string;
  },
  userId: string,
): Promise<Memory> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownedBookId = user?.email ? getBookIdForEmail(user.email) : undefined;
  if (ownedBookId && input.bookId !== ownedBookId) {
    throw new Error("Memories can only be added to your own book");
  }

  const memoryDate = input.date.includes("T")
    ? input.date.split("T")[0]
    : input.date;

  const { data: memory, error: memoryError } = await db
    .memories(supabase)
    .insertReturningId({
      book_id: input.bookId,
      title: input.title,
      story: input.story,
      created_by: userId,
      memory_date: memoryDate,
      location: input.location ?? null,
    });

  if (memoryError || !memory) {
    throw new Error(memoryError?.message ?? "Failed to create memory");
  }

  const memoryId = memory.id;

  if (input.photos && input.photos.length > 0) {
    await db.memoryPhotos(supabase).insertMany(
      input.photos.map((photo, index) => ({
        memory_id: memoryId,
        image_url: photo.imageUrl,
        storage_path: photo.storagePath,
        display_order: index,
      })),
    );
  }

  if (input.tags && input.tags.length > 0) {
    const tagIds = await resolveTagIds(supabase, input.tags);
    await linkMemoryTags(supabase, memoryId, tagIds);
  }

  if (input.perspective) {
    await db.memoryPerspectives(supabase).insert({
      memory_id: memoryId,
      author_id: userId,
      story: input.perspective,
    });
  }

  return mapRowToMemory({
    id: memoryId,
    book_id: input.bookId,
    title: input.title,
    story: input.story,
    location: input.location ?? null,
    memory_date: memoryDate,
    created_by: userId,
    created_at: new Date().toISOString(),
    memory_photos: (input.photos ?? []).map((photo, index) => ({
      image_url: photo.imageUrl,
      storage_path: photo.storagePath,
      display_order: index,
    })),
    memory_tags: (input.tags ?? []).map((name) => ({
      tag_id: "",
      tags: { name: name.trim().toLowerCase() },
    })),
    memory_perspectives: input.perspective
      ? [
          {
            story: input.perspective,
            author_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profiles: null,
          },
        ]
      : [],
    profiles: null,
  } as unknown as MemoryWithRelations);
}

/** Deletes a memory and its uploaded photos. Only the creator may delete. */
export async function deleteMemory(memory: Memory): Promise<void> {
  if (!memory.id) {
    throw new Error("Invalid memory");
  }

  const response = await fetch(`/api/memories/${memory.id}`, {
    method: "DELETE",
    cache: "no-store",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to delete memory");
  }
}
