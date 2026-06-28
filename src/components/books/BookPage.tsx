"use client";

import { forwardRef, memo } from "react";
import { MemoryStamp } from "@/components/memories/MemoryStamp";
import { cn } from "@/lib/utils/cn";
import type { Memory } from "@/lib/types/memory";

interface BookPageProps {
  memories: Memory[];
  pageTitle?: string;
  pageNumber: number;
  onMemoryClick: (memory: Memory) => void;
  className?: string;
  deferImages?: boolean;
  animateStamps?: boolean;
  enableStampHover?: boolean;
  liteStamps?: boolean;
  /** Flip index of this memory page (cover = 0). */
  flipPageIndex?: number;
  currentFlipPage?: number;
}

/** Scrapbook-style page with margin decoration and stamp collage. */
export const BookPage = memo(
  forwardRef<HTMLDivElement, BookPageProps>(function BookPage(
    {
      memories,
      pageTitle,
      pageNumber,
      onMemoryClick,
      className,
      deferImages = false,
      animateStamps = true,
      enableStampHover = true,
      liteStamps = false,
      flipPageIndex,
      currentFlipPage,
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full h-full overflow-hidden",
          liteStamps ? "book-page--android" : "texture-paper",
          !liteStamps &&
            "shadow-[inset_-3px_0_12px_rgba(0,0,0,0.06),inset_2px_0_6px_rgba(255,255,255,0.3)]",
          className,
        )}
      >
        <div className="absolute inset-2 sm:inset-3 border border-warm-brown/[0.08] pointer-events-none" />
        {!liteStamps && (
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/[0.04] to-transparent pointer-events-none" />
        )}

        <div className="relative h-full flex flex-col p-3 sm:p-5 md:p-7">
          {pageTitle && (
            <header className="mb-3 sm:mb-4 shrink-0">
              <h2 className="font-heading text-base sm:text-lg md:text-xl text-warm-brown tracking-wide">
                {pageTitle}
              </h2>
              <div className="mt-1.5 h-px w-full bg-gradient-to-r from-warm-brown/20 via-antique-gold/30 to-transparent" />
            </header>
          )}

          <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3 md:gap-5 content-start auto-rows-min min-h-0">
            {memories.map((memory, i) => (
              <MemoryStamp
                key={memory.id}
                memory={memory}
                index={i}
                onClick={() => onMemoryClick(memory)}
                deferImage={deferImages}
                animate={animateStamps}
                enableHover={enableStampHover}
                lite={liteStamps}
                priority={
                  !deferImages &&
                  liteStamps &&
                  flipPageIndex !== undefined &&
                  currentFlipPage === flipPageIndex
                }
              />
            ))}
          </div>

          <span className="absolute bottom-2 sm:bottom-3 right-3 sm:right-5 font-body text-[0.6rem] sm:text-xs text-warm-brown/35 tabular-nums">
            {pageNumber}
          </span>
        </div>
      </div>
    );
  }),
);
