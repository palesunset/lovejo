"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { groupMemoriesByTimeline } from "@/lib/utils/dates";
import type { Memory } from "@/lib/types/memory";

const MemoryModal = dynamic(
  () =>
    import("@/components/memories/MemoryModal").then((mod) => ({
      default: mod.MemoryModal,
    })),
  { ssr: false },
);

interface TimelineViewProps {
  memories: Memory[];
}

/**
 * Chronological timeline grouped by year and month.
 */
export function TimelineView({ memories: initialMemories }: TimelineViewProps) {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [memories, setMemories] = useState(initialMemories);

  useEffect(() => {
    setMemories(initialMemories);
  }, [initialMemories]);

  const handleMemoryDeleted = useCallback((memoryId: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== memoryId));
    setSelectedMemory(null);
  }, []);

  const timeline = useMemo(
    () =>
      groupMemoriesByTimeline(
        memories.map((m) => ({ id: m.id, title: m.title, date: m.date })),
      ),
    [memories],
  );

  const memoryMap = useMemo(
    () => new Map(memories.map((m) => [m.id, m])),
    [memories],
  );

  return (
    <div className="min-h-screen texture-paper px-4 py-8 sm:px-8 max-w-2xl mx-auto">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="font-heading text-3xl text-warm-brown">Timeline</h1>
        <p className="font-accent text-lg text-muted-green mt-2">
          Every moment, in order
        </p>
      </motion.header>

      <div className="relative">
        <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-warm-brown/15" />

        {timeline.map((yearGroup, yearIndex) => (
          <motion.section
            key={yearGroup.year}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: yearIndex * 0.1, duration: 0.5 }}
            className="mb-10"
          >
            <h2 className="font-heading text-2xl text-antique-gold ml-10 sm:ml-14 mb-4">
              {yearGroup.year}
            </h2>

            {yearGroup.months.map((monthGroup) => (
              <div key={`${yearGroup.year}-${monthGroup.month}`} className="mb-6">
                <h3 className="font-body text-sm uppercase tracking-wider text-warm-brown/50 ml-10 sm:ml-14 mb-3">
                  {monthGroup.month}
                </h3>

                <ul className="space-y-2">
                  {monthGroup.memories.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => {
                          const full = memoryMap.get(entry.id);
                          if (full) setSelectedMemory(full);
                        }}
                        className="group flex items-center gap-3 ml-6 sm:ml-10 w-full text-left py-2 px-3 rounded-lg hover:bg-warm-brown/5 transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full bg-antique-gold shrink-0 group-hover:scale-125 transition-transform" />
                        <span className="font-body text-charcoal group-hover:text-warm-brown transition-colors">
                          {entry.title}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.section>
        ))}

        {timeline.length === 0 && (
          <p className="text-center font-body text-charcoal/50 mt-12">
            No memories yet. Add your first one!
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
    </div>
  );
}
