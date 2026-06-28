import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database";
import type { AppSupabaseClient } from "@/lib/supabase/types";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/utils/supabase-config";

export function createClient(): AppSupabaseClient {
  return createBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
  );
}

export { isSupabaseConfigured };
