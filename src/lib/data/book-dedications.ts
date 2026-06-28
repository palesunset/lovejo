import type { BookOwnerSlug } from "@/lib/utils/book-owners";
import { JO_BOOK_ID, RU_BOOK_ID } from "@/lib/utils/book-owners";

export interface BookDedication {
  body: string;
  closing: string;
}

export const BOOK_DEDICATIONS: Record<BookOwnerSlug, BookDedication> = {
  jo: {
    body: "May these pages remind us that life is not measured by number of days we live, but by the moments that make us feel truly alive.",
    closing: "Let's make every page count.",
  },
  ru: {
    body: "May these pages serve as a canvas for our memories, reminding us that a life well-lived is measured in fleeting moments, not passing days.",
    closing: "Let's make every chapter matter.",
  },
};

export function getBookDedication(book: {
  id: string;
  ownerSlug?: BookOwnerSlug;
  coverVariant?: "fire" | "ice";
}): BookDedication {
  if (book.ownerSlug) {
    return BOOK_DEDICATIONS[book.ownerSlug];
  }
  if (book.id === JO_BOOK_ID || book.coverVariant === "fire") {
    return BOOK_DEDICATIONS.jo;
  }
  if (book.id === RU_BOOK_ID || book.coverVariant === "ice") {
    return BOOK_DEDICATIONS.ru;
  }
  return BOOK_DEDICATIONS.jo;
}
