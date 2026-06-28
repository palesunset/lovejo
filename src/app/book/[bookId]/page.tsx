import { notFound } from "next/navigation";
import { StoryBook } from "@/components/books/StoryBook";
import {
  fetchBookById,
  fetchMemoriesByBookId,
} from "@/lib/services/memory-service.server";

interface BookPageProps {
  params: Promise<{ bookId: string }>;
}

export const revalidate = 30;

export default async function BookPage({ params }: BookPageProps) {
  const { bookId } = await params;
  const book = await fetchBookById(bookId);

  if (!book) {
    notFound();
  }

  const memories = await fetchMemoriesByBookId(book.id);

  return <StoryBook book={book} memories={memories} />;
}
