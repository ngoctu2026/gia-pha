import { RefObject, useMemo, useRef, useState } from "react";

export function usePanZoom(containerRef: RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(1);
  const [isPressed, setIsPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startLeft = useRef(0);
  const startTop = useRef(0);

  const handlers = useMemo(() => ({
    handleMouseDown: (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      setIsPressed(true);
      startX.current = e.clientX;
      startY.current = e.clientY;
      startLeft.current = containerRef.current.scrollLeft;
      startTop.current = containerRef.current.scrollTop;
    },
    handleMouseMove: (e: React.MouseEvent) => {
      if (!containerRef.current || !isPressed) return;
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;
      if (Math.abs(dx) + Math.abs(dy) > 4) setIsDragging(true);
      containerRef.current.scrollLeft = startLeft.current - dx;
      containerRef.current.scrollTop = startTop.current - dy;
    },
    handleMouseUpOrLeave: () => {
      setIsPressed(false);
      setTimeout(() => setIsDragging(false), 0);
    },
    handleClickCapture: (e: React.MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    handleZoomIn: () => setScale((s) => Math.min(3, +(s + 0.1).toFixed(2))),
    handleZoomOut: () => setScale((s) => Math.max(0.3, +(s - 0.1).toFixed(2))),
    handleResetZoom: () => setScale(1),
  }), [containerRef, isDragging, isPressed]);

  return { scale, isPressed, isDragging, handlers };
}
