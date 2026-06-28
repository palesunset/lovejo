import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils/supabase-config";

/** Server-side auth snapshot for hydrating client nav without duplicate getUser. */
export async function getServerUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}
