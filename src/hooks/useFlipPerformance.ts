"use client";

import { useEffect, useState } from "react";
import { isAndroidDevice } from "@/lib/utils/device";

export interface FlipPerformancePrefs {
  /** True on Android phones/tablets — triggers flip-specific optimizations. */
  isAndroid: boolean;
  /** Disable canvas shadows during flip (Android only). */
  drawShadow: boolean;
  /** Page-flip animation duration (ms). */
  flippingTime: number;
  /** Skip stamp entrance motion during flips. */
  reduceStampMotion: boolean;
  /** Touch device — disable hover lift on stamps. */
  isCoarsePointer: boolean;
  /** Lighter stamp chrome (no perforated edge, no image filters). */
  liteStamps: boolean;
  /** Pages within this distance of the current page may load images (0 = current only). */
  preloadRadius: number;
  /** Skip ambient gradients and backdrop blur in the book chrome. */
  liteChrome: boolean;
  /** Pause image decode while a page is turning (Android only). */
  deferImagesWhileFlipping: boolean;
}

const DESKTOP: FlipPerformancePrefs = {
  isAndroid: false,
  drawShadow: true,
  flippingTime: 900,
  reduceStampMotion: false,
  isCoarsePointer: false,
  liteStamps: false,
  preloadRadius: 1,
  liteChrome: false,
  deferImagesWhileFlipping: false,
};

/**
 * Tunes react-pageflip per platform. iOS keeps the full scrapbook look;
 * Android gets lighter GPU work because 3D page flips jank badly there.
 */
export function useFlipPerformance(): FlipPerformancePrefs {
  const [prefs, setPrefs] = useState<FlipPerformancePrefs>(DESKTOP);

  useEffect(() => {
    const android = isAndroidDevice();
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setPrefs({
      isAndroid: android,
      drawShadow: !android && !reduced,
      flippingTime: reduced ? 380 : android ? 420 : coarse ? 700 : 900,
      reduceStampMotion: android || reduced,
      isCoarsePointer: coarse,
      liteStamps: android,
      preloadRadius: android ? 0 : 1,
      liteChrome: android,
      deferImagesWhileFlipping: android,
    });
  }, []);

  return prefs;
}
