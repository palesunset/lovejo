"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthUserState {
  userId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface UseAuthUserOptions {
  /** Hydrate from server to skip client getUser on first paint. */
  initialUserId?: string | null;
}

/** Client-side auth state for gating write actions in the UI. */
export function useAuthUser(options: UseAuthUserOptions = {}): AuthUserState {
  const { initialUserId = null } = options;
  const [userId, setUserId] = useState<string | null>(initialUserId);
  const [isLoading, setIsLoading] = useState(initialUserId === null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setUserId("demo-user");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    let mounted = true;

    const resolveUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (mounted) {
        setUserId(user?.id ?? null);
        setIsLoading(false);
      }
    };

    if (initialUserId === null) {
      void resolveUser();
    } else {
      setIsLoading(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUserId(session?.user?.id ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialUserId]);

  return {
    userId,
    isLoading,
    isAuthenticated: userId !== null,
  };
}
