import { BookShelf } from "@/components/books/BookShelf";
import { NavigationBar } from "@/components/layout/NavigationBar";
import { fetchBooks } from "@/lib/services/memory-service.server";
import { getServerUserId } from "@/lib/services/auth-server";

export const revalidate = 30;

export default async function HomePage() {
  const [books, initialUserId] = await Promise.all([
    fetchBooks(),
    getServerUserId(),
  ]);

  return (
    <>
      <BookShelf books={books} />
      <NavigationBar books={books} initialUserId={initialUserId} />
    </>
  );
}
