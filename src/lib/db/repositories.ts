import type {
  MemoryInsert,
  MemoryPhotoInsert,
  MemoryPerspectiveInsert,
  MemoryTagInsert,
  TagInsert,
} from "@/lib/types/database";
import type { AppSupabaseClient } from "@/lib/supabase/types";

/**
 * Typed table accessors — keeps Supabase calls aligned with the schema.
 */
export const db = {
  memories(client: AppSupabaseClient) {
    return {
      insert: (row: MemoryInsert) => client.from("memories").insert(row),
      insertReturningId: (row: MemoryInsert) =>
        client.from("memories").insert(row).select("id").single(),
      selectWithRelations: (memoryId: string) =>
        client.from("memories").select("*").eq("id", memoryId).single(),
      deleteById: (memoryId: string) =>
        client.from("memories").delete().eq("id", memoryId),
    };
  },

  memoryPhotos(client: AppSupabaseClient) {
    return {
      insertMany: (rows: MemoryPhotoInsert[]) =>
        client.from("memory_photos").insert(rows),
      selectStoragePaths: (memoryId: string) =>
        client
          .from("memory_photos")
          .select("storage_path")
          .eq("memory_id", memoryId),
    };
  },

  memoryPerspectives(client: AppSupabaseClient) {
    return {
      insert: (row: MemoryPerspectiveInsert) =>
        client.from("memory_perspectives").insert(row),
    };
  },

  tags(client: AppSupabaseClient) {
    return {
      findByName: (name: string) =>
        client.from("tags").select("id").eq("name", name).maybeSingle(),
      insert: (row: TagInsert) =>
        client.from("tags").insert(row).select("id").single(),
    };
  },

  memoryTags(client: AppSupabaseClient) {
    return {
      insert: (row: MemoryTagInsert) =>
        client.from("memory_tags").insert(row),
    };
  },

  books(client: AppSupabaseClient) {
    return {
      selectAll: () => client.from("books").select("*").order("created_at"),
      selectById: (id: string) =>
        client.from("books").select("*").eq("id", id).single(),
    };
  },

  profiles(client: AppSupabaseClient) {
    return {
      selectById: (id: string) =>
        client
          .from("profiles")
          .select("display_name, email, avatar_url")
          .eq("id", id)
          .single(),
    };
  },
};
