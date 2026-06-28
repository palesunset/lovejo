import { redirect } from "next/navigation";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { NavigationBar } from "@/components/layout/NavigationBar";
import { createClient } from "@/lib/supabase/server";
import { fetchBooks } from "@/lib/services/memory-service.server";
import { resolvePartnerDisplayName } from "@/lib/utils/book-owners";
import { isSupabaseConfigured } from "@/lib/utils/supabase-config";

export default async function ProfilePage() {
  const books = await fetchBooks();

  if (!isSupabaseConfigured()) {
    return (
      <>
        <ProfileContent
          displayName="Demo User"
          email="demo@example.com"
        />
        <NavigationBar books={books} initialUserId="demo-user" />
      </>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email, avatar_url")
    .eq("id", user.id)
    .single();

  const displayName = resolvePartnerDisplayName({
    email: profile?.email ?? user.email,
    fallback: profile?.display_name,
  });

  return (
    <>
      <ProfileContent
        displayName={displayName}
        email={profile?.email ?? user.email ?? ""}
        avatarUrl={profile?.avatar_url ?? undefined}
      />
      <NavigationBar books={books} initialUserId={user.id} />
    </>
  );
}
