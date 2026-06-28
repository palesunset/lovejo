import { TimelineView } from "@/components/timeline/TimelineView";
import { NavigationBar } from "@/components/layout/NavigationBar";
import { fetchAllMemories, fetchBooks } from "@/lib/services/memory-service.server";
import { getServerUserId } from "@/lib/services/auth-server";

export const revalidate = 30;

export default async function TimelinePage() {
  const [memories, books, initialUserId] = await Promise.all([
    fetchAllMemories(),
    fetchBooks(),
    getServerUserId(),
  ]);

  return (
    <>
      <TimelineView memories={memories} />
      <NavigationBar books={books} initialUserId={initialUserId} />
    </>
  );
}
