"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { Book } from "@/lib/types/memory";

interface BookCoverProps {
  book: Book;
  index?: number;
}

const coverStyles = {
  fire: {
    leather: "texture-leather-fire",
    spine: "bg-[#2a0804]",
    label: "bg-[#fff5eb]/95 text-[#5c1508]",
    edge: "from-[#ffe8cc] to-[#e8c4a0]",
    filigree: "border-orange-400/55",
    divider: "bg-orange-400/50",
    hoverShadow:
      "group-hover:shadow-[8px_14px_28px_rgba(180,40,10,0.35),16px_32px_56px_rgba(0,0,0,0.55)]",
  },
  ice: {
    leather: "texture-leather-ice",
    spine: "bg-[#0a1520]",
    label: "bg-[#f0f8ff]/95 text-[#1a3550]",
    edge: "from-[#e8f4ff] to-[#b8d4e8]",
    filigree: "border-sky-200/50",
    divider: "bg-sky-300/45",
    hoverShadow:
      "group-hover:shadow-[8px_14px_28px_rgba(60,120,200,0.3),16px_32px_56px_rgba(0,0,0,0.55)]",
  },
};

/**
 * Fire & ice leather-bound books with themed embossing and glow.
 */
export function BookCover({ book, index = 0 }: BookCoverProps) {
  const router = useRouter();
  const variant = book.coverVariant ?? (index === 0 ? "fire" : "ice");
  const style = coverStyles[variant];

  return (
    <motion.button
      type="button"
      onClick={() => router.push(`/book/${book.id}`)}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -18,
        rotateY: -6,
        rotateZ: index === 0 ? -1 : 1,
        transition: { duration: 0.35, ease: "easeOut" },
      }}
      className={cn(
        "group relative cursor-pointer",
        "w-36 h-52 sm:w-48 sm:h-[17rem] md:w-56 md:h-80",
        "[perspective:900px]",
      )}
      style={{ transformStyle: "preserve-3d" }}
      aria-label={`Open ${book.title}`}
    >
      {/* Themed ambient glow on hover */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-4 rounded-lg opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100",
          variant === "fire"
            ? "bg-[radial-gradient(circle,rgba(255,100,30,0.25)_0%,transparent_70%)]"
            : "bg-[radial-gradient(circle,rgba(120,190,255,0.2)_0%,transparent_70%)]",
        )}
        aria-hidden
      />

      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[85%] h-4 bg-black/40 rounded-[50%] blur-md transition-all duration-300 group-hover:w-[95%] group-hover:bg-black/50 group-hover:blur-lg" />

      <motion.div
        className={cn(
          "relative w-full h-full rounded-r-md rounded-l-[3px]",
          "shadow-[6px_10px_20px_var(--shadow-warm),12px_24px_48px_var(--shadow-deep)]",
          style.hoverShadow,
          "transition-shadow duration-300",
          style.leather,
        )}
      >
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-[14px] sm:w-4 rounded-l-[3px]",
            "shadow-[inset_-3px_0_6px_rgba(0,0,0,0.4)]",
            style.spine,
          )}
        />

        <div
          className={cn(
            "absolute left-1 top-[15%] bottom-[15%] w-px",
            variant === "fire" ? "bg-orange-300/25" : "bg-sky-200/25",
          )}
        />
        <div className="absolute left-2.5 top-[20%] bottom-[20%] w-px bg-black/20" />

        <div
          className={cn(
            "absolute top-4 left-6 right-4 h-10 border-t border-l rounded-tl",
            style.filigree,
          )}
        />
        <div
          className={cn(
            "absolute bottom-4 left-6 right-4 h-10 border-b border-r rounded-br",
            style.filigree,
          )}
        />

        {/* Center emblem */}
        <div
          className={cn(
            "absolute left-1/2 top-[22%] -translate-x-1/2 text-lg sm:text-xl",
            variant === "fire" ? "text-orange-400/70" : "text-sky-200/70",
          )}
          aria-hidden
        >
          {variant === "fire" ? "🔥" : "❄️"}
        </div>

        <div
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-2",
            "w-[78%] py-4 px-3 rounded-sm",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_2px_8px_rgba(0,0,0,0.2)]",
            style.label,
          )}
        >
          <p className="font-heading text-sm sm:text-base md:text-lg font-semibold text-center leading-snug tracking-wide">
            {book.title}
          </p>
          <div className={cn("mx-auto my-2 w-8 h-px", style.divider)} />
          {book.description && (
            <p className="font-body text-[0.55rem] sm:text-[0.65rem] text-center tracking-[0.15em] uppercase opacity-60">
              {book.description}
            </p>
          )}
        </div>

        <div
          className={cn(
            "absolute right-0 top-1 bottom-1 w-[5px] sm:w-1.5 rounded-r-sm bg-gradient-to-r",
            style.edge,
          )}
        />
        <div className="absolute right-[5px] top-2 bottom-2 w-px bg-white/30" />
      </motion.div>
    </motion.button>
  );
}
