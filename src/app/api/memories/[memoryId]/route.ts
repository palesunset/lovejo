import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/repositories";

const memoryIdSchema = z.string().uuid();

interface RouteParams {
  params: Promise<{ memoryId: string }>;
}

export async function DELETE(
  _request: Request,
  { params }: RouteParams,
): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { memoryId: rawId } = await params;
  const parsed = memoryIdSchema.safeParse(rawId);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid memory id" }, { status: 400 });
  }

  const memoryId = parsed.data;

  const { data: memory, error: fetchError } = await supabase
    .from("memories")
    .select("id, created_by")
    .eq("id", memoryId)
    .single();

  if (fetchError || !memory) {
    return NextResponse.json({ error: "Memory not found" }, { status: 404 });
  }

  if (memory.created_by !== user.id) {
    return NextResponse.json(
      { error: "You can only delete your own entries" },
      { status: 403 },
    );
  }

  const { data: photos } = await db
    .memoryPhotos(supabase)
    .selectStoragePaths(memoryId);

  const storagePaths =
    photos
      ?.map((p) => p.storage_path)
      .filter((path): path is string => Boolean(path)) ?? [];

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("memory-photos")
      .remove(storagePaths);

    if (storageError) {
      return NextResponse.json(
        { error: "Failed to remove photos from storage" },
        { status: 500 },
      );
    }
  }

  const { error: deleteError } = await db
    .memories(supabase)
    .deleteById(memoryId);

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message ?? "Failed to delete memory" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
