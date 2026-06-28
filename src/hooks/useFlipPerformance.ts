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
  /** Lighter stamp chrome (no perforated edge, no image filters). */
  liteStamps: boolean;
  /** Pages within this distance of the current page may load images (0 = current only). */
  preloadRadius: number;
  /** Skip ambient gradients and backdrop blur in the book chrome. */
  liteChrome: boolean;
}

const DESKTOP: FlipPerformancePrefs = {
  drawShadow: true,
  flippingTime: 900,
  reduceStampMotion: false,
  isCoarsePointer: false,
  liteStamps: false,
  preloadRadius: 1,
  liteChrome: false,
};

/**
 * Tunes react-pageflip for touch devices — shadows, filters, and mid-flip
 * image decode are the main sources of mobile jank (especially Android).
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
      flippingTime: reduced ? 380 : mobileLike ? 420 : 900,
      reduceStampMotion: mobileLike || reduced,
      isCoarsePointer: coarse,
      liteStamps: mobileLike,
      preloadRadius: mobileLike ? 0 : 1,
      liteChrome: mobileLike,
    });
  }, []);

  return prefs;
}
