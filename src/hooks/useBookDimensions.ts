"use client";

import { useEffect, useMemo, useState } from "react";
import { isAndroidDevice } from "@/lib/utils/device";

export interface BookDimensions {
  width: number;
  height: number;
}

/** Single-page aspect ratio (width / height) */
const PAGE_ASPECT = 0.72;

interface UseBookDimensionsOptions {
  headerHeight?: number;
  footerHeight?: number;
  horizontalPadding?: number;
  maxPageWidth?: number;
  maxPageHeight?: number;
  viewportScale?: number;
  /** When true, book shows one page at a time (not a two-page spread) */
  singlePage?: boolean;
  /** `immersive` fills the opened book view; `default` is more conservative */
  preset?: "default" | "immersive";
}

const PRESETS = {
  default: {
    viewportScale: 0.78,
    maxPageWidth: 420,
    maxPageHeight: 560,
    headerHeight: 64,
    footerHeight: 72,
    horizontalPadding: 40,
  },
  immersive: {
    viewportScale: 0.94,
    maxPageWidth: 720,
    maxPageHeight: 920,
    headerHeight: 48,
    footerHeight: 52,
    horizontalPadding: 12,
  },
  /** Smaller flip canvas on touch — less GPU work per page turn */
  immersiveMobile: {
    viewportScale: 0.9,
    maxPageWidth: 400,
    maxPageHeight: 560,
    headerHeight: 48,
    footerHeight: 52,
    horizontalPadding: 8,
  },
} as const;

function resolvePresetKey(
  preset: "default" | "immersive",
  android: boolean,
): keyof typeof PRESETS {
  if (preset === "immersive" && android) {
    return "immersiveMobile";
  }
  return preset;
}

/**
 * Calculates react-pageflip page dimensions — sized to fit inside the viewport.
 */
export function useBookDimensions({
  preset = "default",
  headerHeight,
  footerHeight,
  horizontalPadding,
  maxPageWidth,
  maxPageHeight,
  viewportScale,
  singlePage = true,
}: UseBookDimensionsOptions = {}): BookDimensions {
  const [android, setAndroid] = useState(false);

  useEffect(() => {
    setAndroid(isAndroidDevice());
  }, []);

  const activePresetKey = resolvePresetKey(preset, android);
  const base = PRESETS[activePresetKey];

  const resolved = useMemo(
    () => ({
      headerHeight: headerHeight ?? base.headerHeight,
      footerHeight: footerHeight ?? base.footerHeight,
      horizontalPadding: horizontalPadding ?? base.horizontalPadding,
      maxPageWidth: maxPageWidth ?? base.maxPageWidth,
      maxPageHeight: maxPageHeight ?? base.maxPageHeight,
      viewportScale: viewportScale ?? base.viewportScale,
    }),
    [
      headerHeight,
      footerHeight,
      horizontalPadding,
      maxPageWidth,
      maxPageHeight,
      viewportScale,
      base,
    ],
  );

  const [dimensions, setDimensions] = useState<BookDimensions>({
    width: preset === "immersive" ? 360 : 300,
    height: preset === "immersive" ? 500 : 420,
  });

  useEffect(() => {
    const update = () => {
      const vw = window.visualViewport?.width ?? window.innerWidth;
      const vh = window.visualViewport?.height ?? window.innerHeight;

      const availableW =
        (vw - resolved.horizontalPadding * 2) * resolved.viewportScale;
      const availableH =
        (vh -
          resolved.headerHeight -
          resolved.footerHeight -
          resolved.horizontalPadding) *
        resolved.viewportScale;

      let pageH = availableH;
      let pageW = pageH * PAGE_ASPECT;

      const maxSpreadW = singlePage ? availableW : availableW / 2;
      if (pageW > maxSpreadW) {
        pageW = maxSpreadW;
        pageH = pageW / PAGE_ASPECT;
      }

      pageW = Math.min(pageW, resolved.maxPageWidth);
      pageH = Math.min(pageH, resolved.maxPageHeight);

      if (pageW / pageH > PAGE_ASPECT) {
        pageW = pageH * PAGE_ASPECT;
      } else {
        pageH = pageW / PAGE_ASPECT;
      }

      setDimensions({
        width: Math.max(240, Math.floor(pageW)),
        height: Math.max(320, Math.floor(pageH)),
      });
    };

    update();
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, [
    resolved.headerHeight,
    resolved.footerHeight,
    resolved.horizontalPadding,
    resolved.maxPageWidth,
    resolved.maxPageHeight,
    resolved.viewportScale,
    singlePage,
  ]);

  return dimensions;
}
