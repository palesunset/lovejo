"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { BookPage } from "@/components/books/BookPage";
import { useBookDimensions } from "@/hooks/useBookDimensions";
import { useFlipPerformance } from "@/hooks/useFlipPerformance";
import { chunkArray } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import { getBookDedication } from "@/lib/data/book-dedications";
import type { Memory, Book } from "@/lib/types/memory";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

const MemoryModal = dynamic(
  () =>
    import("@/components/memories/MemoryModal").then((mod) => ({
      default: mod.MemoryModal,
    })),
  { ssr: false },
);

interface StoryBookProps {
  book: Book;
  memories: Memory[];
}

const STAMPS_PER_PAGE = 4;

const PAGE_TITLES = [
  "The Beginning",
  "First Adventure",
  "More Moments",
  "Our Journey",
  "Treasured Times",
];

/**
 * Full-viewport immersive storybook with responsive page sizing.
 */
export function StoryBook({ book, memories: initialMemories }: StoryBookProps) {
  const bookRef = useRef<{
    pageFlip: () => {
      flipNext: () => void;
      flipPrev: () => void;
      getCurrentPageIndex: () => number;
    };
  }>(null);
  const [currentPage, setCurrentPage] = useState(0);
  /** Image preload window — updated after flip ends to avoid jank mid-animation. */
  const [renderPage, setRenderPage] = useState(0);
  const flipEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [memories, setMemories] = useState(initialMemories);
  const bookSize = useBookDimensions({ preset: "immersive" });
  const flipPrefs = useFlipPerformance();

  useEffect(() => {
    return () => {
      if (flipEndTimerRef.current) {
        clearTimeout(flipEndTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setMemories(initialMemories);
  }, [initialMemories]);

  const handleMemoryDeleted = useCallback((memoryId: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== memoryId));
    setSelectedMemory(null);
  }, []);

  const memoryPages = useMemo(
    () => chunkArray(memories, STAMPS_PER_PAGE),
    [memories],
  );
  const totalPages = memoryPages.length + 2;

  const isPageNearViewport = useCallback(
    (pageIndex: number) => Math.abs(renderPage - (pageIndex + 1)) <= 1,
    [renderPage],
  );

  const handleFlipNext = useCallback(() => {
    bookRef.current?.pageFlip().flipNext();
  }, []);

  const handleFlipPrev = useCallback(() => {
    bookRef.current?.pageFlip().flipPrev();
  }, []);

  const handlePageChange = useCallback(
    (e: { data: number }) => {
      setCurrentPage(e.data);

      if (flipEndTimerRef.current) {
        clearTimeout(flipEndTimerRef.current);
      }

      flipEndTimerRef.current = setTimeout(() => {
        setRenderPage(e.data);
      }, flipPrefs.flippingTime + 80);
    },
    [flipPrefs.flippingTime],
  );

  const theme = book.coverVariant ?? "fire";
  const isFire = theme === "fire";
  const dedication = getBookDedication(book);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col h-dvh w-full overflow-hidden",
        isFire ? "texture-reading-room-fire" : "texture-reading-room-ice",
      )}
    >
      {/* Ambient warm lamp */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: isFire
            ? "radial-gradient(ellipse 55% 45% at 50% 38%, rgba(255, 120, 40, 0.15) 0%, transparent 70%)"
            : "radial-gradient(ellipse 55% 45% at 50% 38%, rgba(140, 200, 255, 0.12) 0%, transparent 70%)",
        }}
      />

      {/* Top bar */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-2 shrink-0"
      >
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 rounded-full border bg-black/20 px-3 py-1.5 text-cream-paper/80 backdrop-blur-sm transition-colors hover:bg-black/30",
            isFire
              ? "border-orange-400/25 hover:text-orange-200"
              : "border-sky-300/25 hover:text-sky-100",
          )}
          aria-label="Back to shelf"
        >
          <Home className="h-4 w-4" />
          <span className="font-body text-xs hidden sm:inline tracking-wide">
            Shelf
          </span>
        </Link>

        <div className="text-center">
          <h1
            className={cn(
              "font-heading text-base sm:text-lg tracking-wide",
              isFire ? "ember-foil" : "frost-foil",
            )}
          >
            {book.title}
          </h1>
          <p className="font-accent text-cream-paper/50 text-sm sm:text-base -mt-0.5">
            {book.description}
          </p>
        </div>

        <div className="w-[72px] sm:w-[88px]" aria-hidden />
      </motion.header>

      {/* Book — centered, constrained to calculated size */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="storybook-stage storybook-stage--immersive relative z-10 flex-1 min-h-0"
      >
        <div
          className="shrink-0"
          style={{
            width: bookSize.width,
            height: bookSize.height,
          }}
        >
          <HTMLFlipBook
            ref={bookRef}
            width={bookSize.width}
            height={bookSize.height}
            size="fixed"
            showCover={true}
            mobileScrollSupport={true}
            className="storybook-flip mx-auto"
            onFlip={handlePageChange}
            drawShadow={flipPrefs.drawShadow}
            usePortrait={true}
            startPage={0}
            flippingTime={flipPrefs.flippingTime}
            useMouseEvents={true}
            clickEventForward={true}
            swipeDistance={30}
          >
          <div
            key="cover"
            className={cn(
              "texture-paper-aged relative w-full h-full flex flex-col overflow-y-auto px-5 pt-5 pb-3 sm:px-8 sm:pt-8 sm:pb-4",
              isFire ? "shadow-[inset_0_0_40px_rgba(255,100,30,0.06)]" : "shadow-[inset_0_0_40px_rgba(100,180,255,0.06)]",
            )}
          >
            <div
              className={cn(
                "absolute inset-3 border pointer-events-none",
                isFire ? "border-orange-900/15" : "border-sky-900/15",
              )}
            />
            <div
              className={cn(
                "absolute top-4 left-4 right-4 h-px",
                isFire ? "bg-orange-400/30" : "bg-sky-300/30",
              )}
            />

            <div className="relative z-10 flex min-h-full flex-1 flex-col w-full">
              {/* Title block — top */}
              <div className="w-full text-center pt-1 sm:pt-2 shrink-0">
                <h2
                  className={cn(
                    "font-heading text-xl sm:text-3xl leading-tight",
                    isFire ? "text-[#5c1508]" : "text-[#1a3550]",
                  )}
                >
                  {book.title}
                </h2>
                <p
                  className={cn(
                    "font-accent text-lg sm:text-xl mt-2",
                    isFire ? "text-orange-700/70" : "text-sky-700/70",
                  )}
                >
                  {book.description}
                </p>
              </div>

              {/* Icon — vertical center */}
              <div className="flex flex-1 items-center justify-center min-h-0 py-2">
                <div
                  className={cn(
                    "w-20 h-20 sm:w-24 sm:h-24 rounded-full border flex items-center justify-center shadow-[inset_0_1px_4px_rgba(0,0,0,0.08)] text-3xl sm:text-5xl shrink-0",
                    isFire ? "border-orange-400/50" : "border-sky-300/50",
                  )}
                >
                  {isFire ? "🔥" : "❄️"}
                </div>
              </div>

              {/* Open to read + notes — bottom */}
              <div className="w-full max-w-[88%] flex flex-col items-center text-center mx-auto pb-0.5 sm:pb-1 shrink-0">
                <p className="font-body text-[0.6rem] sm:text-[0.65rem] text-warm-brown/40 tracking-[0.25em] uppercase">
                  Open to read
                </p>

                <div
                  className={cn(
                    "mt-5 sm:mt-6 w-full border-t pt-5 sm:pt-6 flex flex-col items-center",
                    isFire ? "border-orange-900/12" : "border-sky-900/12",
                  )}
                >
                  <p
                    className={cn(
                      "font-body text-[0.7rem] sm:text-xs leading-relaxed italic text-center text-balance max-w-[32ch]",
                      isFire ? "text-warm-brown/65" : "text-[#1a3550]/65",
                    )}
                  >
                    {dedication.body}
                  </p>
                  <p
                    className={cn(
                      "font-accent text-sm sm:text-base mt-3 text-center",
                      isFire ? "text-orange-800/60" : "text-sky-800/60",
                    )}
                  >
                    {dedication.closing}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {memoryPages.map((pageMemories, pageIndex) => (
            <BookPage
              key={`page-${pageIndex}`}
              memories={pageMemories}
              pageTitle={PAGE_TITLES[pageIndex % PAGE_TITLES.length]}
              pageNumber={pageIndex + 1}
              onMemoryClick={setSelectedMemory}
              deferImages={!isPageNearViewport(pageIndex)}
              animateStamps={
                !flipPrefs.reduceStampMotion && isPageNearViewport(pageIndex)
              }
              enableStampHover={!flipPrefs.isCoarsePointer}
            />
          ))}

          <div
            key="back"
            className="texture-paper-aged relative w-full h-full flex flex-col items-center justify-center p-8"
          >
            <div className="absolute inset-3 border border-warm-brown/10 pointer-events-none" />
            <p className="font-accent text-2xl sm:text-3xl text-warm-brown/50 text-center">
              To be continued...
            </p>
            <div className="mt-6 w-12 h-px bg-antique-gold/30" />
          </div>
        </HTMLFlipBook>
        </div>
      </motion.div>

      {/* Page controls */}
      <motion.footer
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative z-10 flex items-center justify-center gap-5 sm:gap-8 py-2 sm:py-3 shrink-0"
      >
        <button
          type="button"
          onClick={handleFlipPrev}
          disabled={currentPage === 0}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-antique-gold/25 bg-black/25 text-cream-paper backdrop-blur-sm transition-all hover:bg-black/40 hover:border-antique-gold/40 disabled:opacity-25 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
          <span className="font-body text-xs text-cream-paper/70 tracking-widest">
            {currentPage + 1} / {totalPages}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentPage
                    ? cn("w-4", isFire ? "bg-orange-400" : "bg-sky-300")
                    : "w-1 bg-cream-paper/25"
                }`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleFlipNext}
          disabled={currentPage >= totalPages - 1}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-antique-gold/25 bg-black/25 text-cream-paper backdrop-blur-sm transition-all hover:bg-black/40 hover:border-antique-gold/40 disabled:opacity-25 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </motion.footer>

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
