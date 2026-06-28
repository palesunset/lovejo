"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { formatMemoryDate } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import type { Memory } from "@/lib/types/memory";

interface MemoryStampProps {
  memory: Memory;
  index?: number;
  onClick?: () => void;
  /** When true, skip image decode until page is near viewport. */
  deferImage?: boolean;
  /** Skip entrance animation for off-screen pages. */
  animate?: boolean;
  /** Disable lift-on-hover (touch devices). */
  enableHover?: boolean;
  /** Lighter visuals for mobile flip performance. */
  lite?: boolean;
  /** Eager-load image (current page on mobile). */
  priority?: boolean;
}

const rotations = [-4, 2.5, -2, 3.5, -1.5, 2];

function StampChrome({
  memory,
  hasTape,
  tapeRotation,
  deferImage,
  lite,
  priority,
}: {
  memory: Memory;
  hasTape: boolean;
  tapeRotation: number;
  deferImage: boolean;
  lite: boolean;
  priority: boolean;
}) {
  return (
    <>
      {hasTape && !lite && (
        <div
          className="tape-strip absolute -top-2.5 left-1/2 z-10 h-4 w-14 -translate-x-1/2 rounded-[1px]"
          style={{ transform: `translateX(-50%) rotate(${tapeRotation}deg)` }}
        />
      )}

      <div
        className={cn(
          "p-1 sm:p-1.5 rounded-sm",
          lite ? "stamp-border-lite" : "stamp-border",
        )}
      >
        <div className="relative aspect-square overflow-hidden bg-cream-paper-dark">
          {deferImage ? (
            <div
              className={cn(
                "absolute inset-0",
                lite ? "bg-[#fffdf8]" : "bg-cream-paper-dark",
              )}
              aria-hidden
            />
          ) : (
            <Image
              src={memory.photo}
              alt={memory.title}
              fill
              className={cn("object-cover", !lite && "sepia-[0.08]")}
              sizes={lite ? "(max-width: 768px) 28vw, 180px" : "(max-width: 640px) 40vw, 220px"}
              quality={lite ? 65 : 75}
              priority={priority}
              loading={priority ? "eager" : "lazy"}
            />
          )}
          {!lite && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
          )}
        </div>
        <p className="font-body text-[0.55rem] sm:text-[0.65rem] text-charcoal-soft mt-1 sm:mt-1.5 text-center leading-tight px-0.5 line-clamp-2">
          <span className="text-warm-brown/50">{formatMemoryDate(memory.date)}</span>
          {" · "}
          {memory.title}
        </p>
      </div>
    </>
  );
}

/**
 * Postage-stamp memory with perforated edge, washi tape, and lift.
 * Uses a static button on touch/mobile to avoid framer-motion cost during flips.
 */
export const MemoryStamp = memo(function MemoryStamp({
  memory,
  index = 0,
  onClick,
  deferImage = false,
  animate = true,
  enableHover = true,
  lite = false,
  priority = false,
}: MemoryStampProps) {
  const rotation = rotations[index % rotations.length];
  const hasTape = index % 3 === 0;
  const tapeRotation = index % 2 === 0 ? -3 : 4;

  const sharedClass = cn(
    "relative cursor-pointer text-left w-full",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-antique-gold/40 rounded-sm",
  );

  const chrome = (
    <StampChrome
      memory={memory}
      hasTape={hasTape}
      tapeRotation={tapeRotation}
      deferImage={deferImage}
      lite={lite}
      priority={priority}
    />
  );

  if (lite) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={sharedClass}
        style={{ transform: `rotate(${rotation}deg)` }}
        aria-label={`View memory: ${memory.title}`}
      >
        {chrome}
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={animate ? { opacity: 0, scale: 0.88 } : false}
      animate={animate ? { opacity: 1, scale: 1 } : undefined}
      transition={
        animate
          ? { delay: index * 0.06, duration: 0.45, ease: "easeOut" }
          : undefined
      }
      whileHover={
        enableHover
          ? {
              y: -8,
              rotate: rotation + 1.5,
              scale: 1.04,
              zIndex: 10,
            }
          : undefined
      }
      className={sharedClass}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-label={`View memory: ${memory.title}`}
    >
      {chrome}
    </motion.button>
  );
});
