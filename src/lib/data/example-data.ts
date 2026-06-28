import type { Book, Memory, MemoryPhoto } from "@/lib/types/memory";

function photo(url: string, order = 0): MemoryPhoto {
  return { imageUrl: url, displayOrder: order };
}

function memory(
  partial: Omit<Memory, "photos" | "tags" | "perspectives"> & {
    photoUrls?: string[];
    tags?: string[];
    perspectives?: Memory["perspectives"];
  },
): Memory {
  const urls = partial.photoUrls ?? (partial.photo ? [partial.photo] : []);
  const rest = { ...partial };
  delete (rest as { photoUrls?: string[] }).photoUrls;

  return {
    ...rest,
    photo: urls[0] ?? "/placeholder-memory.svg",
    photos: urls.map((url, i) => photo(url, i)),
    tags: partial.tags ?? [],
    perspectives: partial.perspectives ?? [],
  };
}

export const EXAMPLE_BOOKS: Book[] = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    title: "Love, Jo",
    description: "Per Aspera",
    coverVariant: "fire",
    ownerSlug: "jo",
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    title: "Love, Ru",
    description: "AD ASTRA",
    coverVariant: "ice",
    ownerSlug: "ru",
  },
];

export const EXAMPLE_MEMORIES: Memory[] = [
  memory({
    id: "mem-001",
    bookId: "a0000000-0000-4000-8000-000000000001",
    title: "First Coffee",
    photo:
      "https://images.unsplash.com/photo-1495474472283-4d71bcdd2085?w=400&h=400&fit=crop",
    story:
      "We met at the little café on the corner. The rain was tapping against the window, and you ordered something far too complicated. I knew right then this was going to be something special.",
    author: "Jo",
    createdById: "user-jo",
    date: "2024-05-12",
    location: "Downtown Café, Taipei",
    tags: ["firsts", "coffee", "memories"],
    perspectives: [
      {
        memoryId: "mem-001",
        authorId: "user-jo",
        author: "Jo",
        story:
          "It was the happiest day. I almost spilled my latte twice from nerves.",
      },
      {
        memoryId: "mem-001",
        authorId: "user-ru",
        author: "Ru",
        story:
          "I was nervous the whole time, but her laugh made everything feel easy.",
      },
    ],
  }),
  memory({
    id: "mem-002",
    bookId: "a0000000-0000-4000-8000-000000000001",
    title: "Deep Talks",
    photo:
      "https://images.unsplash.com/photo-1516589170181-62e948b5128e?w=400&h=400&fit=crop",
    story:
      "Hours passed like minutes. We talked about childhood dreams, old fears, and the futures we hoped to build — together.",
    author: "Ru",
    createdById: "user-ru",
    date: "2024-06-03",
    location: "Riverside Park",
    tags: ["conversations", "night"],
  }),
  memory({
    id: "mem-003",
    bookId: "a0000000-0000-4000-8000-000000000001",
    title: "Beach Walk",
    photo:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop",
    photoUrls: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1519046909924-38766b4570ac?w=400&h=400&fit=crop",
    ],
    story:
      "Barefoot in the sand, collecting shells like treasures. The ocean kept time with our footsteps.",
    author: "Jo",
    createdById: "user-jo",
    date: "2024-07-18",
    location: "Sunset Beach",
    tags: ["summer", "beach", "adventure"],
  }),
  memory({
    id: "mem-004",
    bookId: "a0000000-0000-4000-8000-000000000001",
    title: "Sunset Drive",
    photo:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=400&fit=crop",
    story:
      "Windows down, music low, golden light pouring through the windshield. No destination — just us and the open road.",
    author: "Ru",
    createdById: "user-ru",
    date: "2024-07-22",
    location: "Coastal Highway",
    tags: ["roadtrip", "sunset"],
  }),
  memory({
    id: "mem-005",
    bookId: "a0000000-0000-4000-8000-000000000002",
    title: "Morning Notes",
    photo:
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=400&fit=crop",
    story:
      "A sticky note on the mirror: 'You make every morning worth waking up for.' I kept it in my journal.",
    author: "Jo",
    createdById: "user-jo",
    date: "2025-01-14",
    tags: ["little-things", "love"],
  }),
  memory({
    id: "mem-006",
    bookId: "a0000000-0000-4000-8000-000000000002",
    title: "Rainy Sunday",
    photo:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=400&fit=crop",
    story:
      "Blankets, old movies, and tea that went cold because we forgot about it. Perfect, in every imperfect way.",
    author: "Ru",
    createdById: "user-ru",
    date: "2025-02-09",
    location: "Home",
    tags: ["cozy", "rain"],
  }),
  memory({
    id: "mem-007",
    bookId: "a0000000-0000-4000-8000-000000000002",
    title: "First Snow",
    photo:
      "https://images.unsplash.com/photo-1418981041474-3f7775ea4107?w=400&h=400&fit=crop",
    story:
      "Our first snowfall together. You caught a flake on your glove and showed me like it was the rarest jewel.",
    author: "Jo",
    createdById: "user-jo",
    date: "2026-01-20",
    tags: ["winter", "firsts"],
    perspectives: [
      {
        memoryId: "mem-007",
        authorId: "user-jo",
        author: "Jo",
        story:
          "I had never seen anyone so excited about snow. His joy was contagious.",
      },
      {
        memoryId: "mem-007",
        authorId: "user-ru",
        author: "Ru",
        story:
          "Everything felt quieter and softer. Like the world paused just for us.",
      },
    ],
  }),
];

export function getBookById(id: string): Book | undefined {
  return EXAMPLE_BOOKS.find((b) => b.id === id);
}

export function getMemoriesByBookId(bookId: string): Memory[] {
  return EXAMPLE_MEMORIES.filter((m) => m.bookId === bookId);
}
