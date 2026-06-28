/** Fixed book IDs from seed.sql */
export const JO_BOOK_ID = "a0000000-0000-4000-8000-000000000001";
export const RU_BOOK_ID = "a0000000-0000-4000-8000-000000000002";

export type BookOwnerSlug = "jo" | "ru";
export type PartnerDisplayName = "Jo" | "Ru";

export function getJoEmail(): string {
  return (
    process.env.NEXT_PUBLIC_JO_EMAIL ??
    process.env.NEXT_PUBLIC_USER_B_EMAIL ??
    "jurenzjesfil.salvio@gmail.com"
  ).toLowerCase();
}

export function getRuEmail(): string {
  return (
    process.env.NEXT_PUBLIC_RU_EMAIL ??
    process.env.NEXT_PUBLIC_USER_A_EMAIL ??
    "sariaruel@gmail.com"
  ).toLowerCase();
}

export function getOwnerSlugForBookId(
  bookId: string,
): BookOwnerSlug | undefined {
  if (bookId === JO_BOOK_ID) return "jo";
  if (bookId === RU_BOOK_ID) return "ru";
  return undefined;
}

export function getPartnerNameFromBookId(
  bookId: string,
): PartnerDisplayName | undefined {
  const slug = getOwnerSlugForBookId(bookId);
  if (slug === "jo") return "Jo";
  if (slug === "ru") return "Ru";
  return undefined;
}

export function getPartnerNameFromEmail(
  email?: string | null,
): PartnerDisplayName | undefined {
  if (!email) return undefined;
  const normalized = email.trim().toLowerCase();
  if (normalized === getJoEmail()) return "Jo";
  if (normalized === getRuEmail()) return "Ru";
  return undefined;
}

/**
 * Always shows "Jo" or "Ru" for the two partners; falls back for unknown users.
 */
export function resolvePartnerDisplayName(options: {
  email?: string | null;
  bookId?: string;
  fallback?: string | null;
}): string {
  const fromEmail = getPartnerNameFromEmail(options.email);
  if (fromEmail) return fromEmail;

  if (options.bookId) {
    const fromBook = getPartnerNameFromBookId(options.bookId);
    if (fromBook) return fromBook;
  }

  const fallback = options.fallback?.trim();
  return fallback || "Unknown";
}

/** Returns the book ID owned by this email, if known. */
export function getBookIdForEmail(email: string): string | undefined {
  const normalized = email.trim().toLowerCase();
  if (normalized === getJoEmail()) return JO_BOOK_ID;
  if (normalized === getRuEmail()) return RU_BOOK_ID;
  return undefined;
}

export function getBookIdForOwner(slug: BookOwnerSlug): string {
  return slug === "jo" ? JO_BOOK_ID : RU_BOOK_ID;
}
