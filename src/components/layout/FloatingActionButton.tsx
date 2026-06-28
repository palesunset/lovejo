"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
  "aria-label"?: string;
}

/** Center add button — gold seal on the starlit nav bar. */
export function FloatingActionButton({
  onClick,
  className,
  "aria-label": ariaLabel = "Add new memory",
}: FloatingActionButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.94 }}
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-full",
        "bg-gradient-to-br from-antique-gold-light via-antique-gold to-soft-copper",
        "text-[#2a1810]",
        "border border-antique-gold-light/50",
        "shadow-[0_4px_20px_rgba(196,160,85,0.35),0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.35)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-antique-gold/60",
        className,
      )}
      aria-label={ariaLabel}
    >
      <Plus className="h-6 w-6" strokeWidth={2.25} />
    </motion.button>
  );
}
