import type { AppSupabaseClient } from "@/lib/supabase/types";
import { normalizeTagName } from "@/lib/services/memory-mappers";

/**
 * Resolves tag names to IDs in two round-trips (lookup + bulk insert + link).
 * Replaces per-tag sequential queries on memory creation.
 */
export async function resolveTagIds(
  client: AppSupabaseClient,
  rawNames: string[],
): Promise<string[]> {
  const names = [
    ...new Set(
      rawNames.map(normalizeTagName).filter((name): name is string => Boolean(name)),
    ),
  ];

  if (names.length === 0) {
    return [];
  }

  const { data: existing, error: lookupError } = await client
    .from("tags")
    .select("id, name")
    .in("name", names);

  if (lookupError) {
    throw new Error(lookupError.message);
  }

  const idByName = new Map((existing ?? []).map((row) => [row.name, row.id]));
  const missing = names.filter((name) => !idByName.has(name));

  if (missing.length > 0) {
    const { data: created, error: insertError } = await client
      .from("tags")
      .insert(missing.map((name) => ({ name })))
      .select("id, name");

    if (insertError) {
      throw new Error(insertError.message);
    }

    for (const row of created ?? []) {
      idByName.set(row.name, row.id);
    }
  }

  return names.map((name) => idByName.get(name)).filter((id): id is string => Boolean(id));
}

export async function linkMemoryTags(
  client: AppSupabaseClient,
  memoryId: string,
  tagIds: string[],
): Promise<void> {
  if (tagIds.length === 0) {
    return;
  }

  const { error } = await client.from("memory_tags").insert(
    tagIds.map((tag_id) => ({
      memory_id: memoryId,
      tag_id,
    })),
  );

  if (error) {
    throw new Error(error.message);
  }
}
