declare module "react-pageflip" {
  import type { ReactNode, Ref } from "react";

  interface FlipBookProps {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    className?: string;
    onFlip?: (e: { data: number }) => void;
    drawShadow?: boolean;
    usePortrait?: boolean;
    startPage?: number;
    flippingTime?: number;
    useMouseEvents?: boolean;
    clickEventForward?: boolean;
    swipeDistance?: number;
    children: ReactNode;
    ref?: Ref<{ pageFlip: () => { flipNext: () => void; flipPrev: () => void; getCurrentPageIndex: () => number } }>;
  }

  const HTMLFlipBook: React.ForwardRefExoticComponent<FlipBookProps>;
  export default HTMLFlipBook;
}
