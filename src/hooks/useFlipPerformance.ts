"use client";

import { useEffect, useState } from "react";

export interface FlipPerformancePrefs {
  /** Disable canvas shadows during flip on touch devices. */
  drawShadow: boolean;
  /** Page-flip animation duration (ms). */
  flippingTime: number;
  /** Skip stamp entrance motion during flips. */
  reduceStampMotion: boolean;
  isCoarsePointer: boolean;
}

const DESKTOP: FlipPerformancePrefs = {
  drawShadow: true,
  flippingTime: 900,
  reduceStampMotion: false,
  isCoarsePointer: false,
};

/**
 * Tunes react-pageflip for touch devices — shadows and mid-flip React updates
 * are the main sources of mobile jank.
 */
export function useFlipPerformance(): FlipPerformancePrefs {
  const [prefs, setPrefs] = useState<FlipPerformancePrefs>(DESKTOP);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.matchMedia("(max-width: 768px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobileLike = coarse || narrow;

    setPrefs({
      drawShadow: !mobileLike && !reduced,
      flippingTime: reduced ? 400 : mobileLike ? 580 : 900,
      reduceStampMotion: mobileLike || reduced,
      isCoarsePointer: coarse,
    });
  }, []);

  return prefs;
}
