import { SearchView } from "@/components/search/SearchView";
import { NavigationBar } from "@/components/layout/NavigationBar";
import { fetchAllMemories, fetchBooks } from "@/lib/services/memory-service.server";
import { getServerUserId } from "@/lib/services/auth-server";

export const revalidate = 30;

export default async function SearchPage() {
  const [memories, books, initialUserId] = await Promise.all([
    fetchAllMemories(),
    fetchBooks(),
    getServerUserId(),
  ]);

  return (
    <>
      <SearchView memories={memories} books={books} />
      <NavigationBar books={books} initialUserId={initialUserId} />
    </>
  );
}
