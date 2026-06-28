"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function ProfileSignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Button
      variant="secondary"
      onClick={handleSignOut}
      className="mt-8 gap-2 inline-flex items-center"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  );
}
