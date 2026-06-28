import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMemorySchema } from "@/lib/validators/memory";
import { normalizeMemoryDateForStorage } from "@/lib/utils/dates";
import { linkMemoryTags, resolveTagIds } from "@/lib/services/tag-service";
import { db } from "@/lib/db/repositories";
import { getBookIdForEmail } from "@/lib/utils/book-owners";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createMemorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { bookId, title, story, date, location, tags } = parsed.data;

  const ownedBookId = user.email ? getBookIdForEmail(user.email) : undefined;
  if (ownedBookId && bookId !== ownedBookId) {
    return NextResponse.json(
      { error: "Memories can only be added to your own book" },
      { status: 403 },
    );
  }

  const memoryDate = normalizeMemoryDateForStorage(date);

  const { data: memory, error } = await db.memories(supabase).insertReturningId({
    book_id: bookId,
    title,
    story: story ?? "",
    created_by: user.id,
    memory_date: memoryDate,
    location: location ?? null,
  });

  if (error || !memory) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create memory" },
      { status: 500 },
    );
  }

  if (tags && tags.length > 0) {
    try {
      const tagIds = await resolveTagIds(supabase, tags);
      await linkMemoryTags(supabase, memory.id, tagIds);
    } catch (tagError) {
      return NextResponse.json(
        {
          error:
            tagError instanceof Error ? tagError.message : "Failed to link tags",
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ id: memory.id }, { status: 201 });
}
