import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
}

/** Lightweight pulse placeholder — no client JS required. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-warm-brown/10", className)}
      aria-hidden
    />
  );
}

export function PageLoadingShell() {
  return (
    <div className="min-h-dvh texture-paper px-4 py-10 max-w-lg mx-auto space-y-6">
      <Skeleton className="mx-auto h-8 w-48" />
      <Skeleton className="h-12 w-full rounded-full" />
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function BookLoadingShell() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center texture-reading-room-fire">
      <Skeleton className="h-[min(72vh,640px)] w-[min(92vw,480px)] rounded-lg" />
      <Skeleton className="mt-6 h-4 w-24" />
    </div>
  );
}

export function ShelfLoadingShell() {
  return (
    <div className="relative min-h-dvh backdrop-home overflow-hidden">
      <div className="relative z-10 pt-10 sm:pt-14 pb-8 text-center px-4 space-y-3">
        <Skeleton className="mx-auto h-3 w-32 bg-cream-paper/10" />
        <Skeleton className="mx-auto h-10 w-64 bg-cream-paper/10" />
        <Skeleton className="mx-auto h-6 w-72 bg-cream-paper/10" />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl px-4 flex justify-center gap-16 pt-8">
        <Skeleton className="h-56 w-36 rounded-md bg-cream-paper/10" />
        <Skeleton className="h-56 w-36 rounded-md bg-cream-paper/10" />
      </div>
    </div>
  );
}
