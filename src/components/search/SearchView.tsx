"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Search as SearchIcon } from "lucide-react";
import type { Book, Memory } from "@/lib/types/memory";

const MemoryModal = dynamic(
  () =>
    import("@/components/memories/MemoryModal").then((mod) => ({
      default: mod.MemoryModal,
    })),
  { ssr: false },
);

interface SearchViewProps {
  memories: Memory[];
  books: Book[];
}

export function SearchView({ memories: initialMemories }: SearchViewProps) {
  const [query, setQuery] = useState("");
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [memories, setMemories] = useState(initialMemories);

  const handleMemoryDeleted = useCallback((memoryId: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== memoryId));
    setSelectedMemory(null);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return memories.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.story.toLowerCase().includes(q) ||
        m.location?.toLowerCase().includes(q) ||
        m.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  }, [query, memories]);

  return (
    <>
      <div className="min-h-screen texture-paper px-4 py-8 max-w-lg mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl text-warm-brown text-center">
            Search Memories
          </h1>
        </motion.header>

        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/30" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, story, location, or tag..."
            className="w-full rounded-full border border-warm-brown/20 bg-cream-paper pl-10 pr-4 py-3 font-body focus:outline-none focus:ring-2 focus:ring-antique-gold/50"
          />
        </div>

        <ul className="space-y-2">
          {results.map((memory) => (
            <li key={memory.id}>
              <button
                type="button"
                onClick={() => setSelectedMemory(memory)}
                className="w-full text-left p-4 rounded-xl bg-cream-paper-dark/50 hover:bg-warm-brown/5 transition-colors"
              >
                <p className="font-heading text-warm-brown">{memory.title}</p>
                <p className="readable-text font-body text-sm text-charcoal/50 mt-1 line-clamp-2">
                  {memory.story}
                </p>
              </button>
            </li>
          ))}
        </ul>

        {query && results.length === 0 && (
          <p className="text-center font-body text-charcoal/40 mt-8">
            No memories found for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {selectedMemory && (
        <MemoryModal
          memory={selectedMemory}
          onClose={() => setSelectedMemory(null)}
          onDeleted={handleMemoryDeleted}
          loadFullDetail
        />
      )}
    </>
  );
}
