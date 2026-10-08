import { useState, useRef, useEffect, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableFloatingOptions {
  /** Optional sessionStorage key to remember position during session */
  storageKey?: string;
  /** Margin in px from screen edges (default 12) */
  boundaryMargin?: number;
}

/**
 * Reusable hook to make floating action buttons, badges, and widgets draggable
 * across the viewport with boundary clamping, smooth pointer events,
 * and reliable distinction between dragging and clicking.
 */
export function useDraggableFloating<T extends HTMLElement = HTMLElement>(
  options: UseDraggableFloatingOptions = {}
) {
  const { storageKey, boundaryMargin = 12 } = options;
  const elementRef = useRef<T | null>(null);

  // Accumulated translation offset from initial CSS position
  const [offset, setOffset] = useState<Position>(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return { x: 0, y: 0 };
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragInfoRef = useRef<{
    isDown: boolean;
    hasMoved: boolean;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
    baseRect: DOMRect | null;
  }>({
    isDown: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    baseRect: null,
  });

  // Re-clamp position inside viewport if screen resizes or rotates
  useEffect(() => {
    const handleResize = () => {
      const el = elementRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const currentRawLeft = rect.left - offset.x;
      const currentRawTop = rect.top - offset.y;

      const minX = boundaryMargin - currentRawLeft;
      const maxX = window.innerWidth - boundaryMargin - (currentRawLeft + rect.width);
      const minY = boundaryMargin - currentRawTop;
      const maxY = window.innerHeight - boundaryMargin - (currentRawTop + rect.height);

      setOffset((prev) => {
        const clampedX = Math.min(Math.max(prev.x, minX), maxX);
        const clampedY = Math.min(Math.max(prev.y, minY), maxY);
        if (clampedX !== prev.x || clampedY !== prev.y) {
          return { x: clampedX, y: clampedY };
        }
        return prev;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [boundaryMargin, offset]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Primary button only
      if (e.button !== 0) return;

      // Do not initiate drag if user interacted with a dismiss/close button or excluded item
      const target = e.target as HTMLElement;
      if (target.closest('button.holo-trigger-dismiss-btn, .no-drag, [data-no-drag="true"]')) {
        return;
      }

      const el = elementRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      dragInfoRef.current = {
        isDown: true,
        hasMoved: false,
        startX: e.clientX,
        startY: e.clientY,
        startOffsetX: offset.x,
        startOffsetY: offset.y,
        baseRect: rect,
      };

      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    },
    [offset]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const info = dragInfoRef.current;
      if (!info.isDown || !info.baseRect) return;

      const dx = e.clientX - info.startX;
      const dy = e.clientY - info.startY;

      // Threshold of 5px to distinguish drag from intentional click
      if (!info.hasMoved && Math.hypot(dx, dy) > 5) {
        info.hasMoved = true;
        setIsDragging(true);
      }

      if (info.hasMoved) {
        let nextX = info.startOffsetX + dx;
        let nextY = info.startOffsetY + dy;

        // Viewport boundaries clamping
        const baseLeft = info.baseRect.left - info.startOffsetX;
        const baseTop = info.baseRect.top - info.startOffsetY;
        const baseWidth = info.baseRect.width;
        const baseHeight = info.baseRect.height;

        const minX = boundaryMargin - baseLeft;
        const maxX = window.innerWidth - boundaryMargin - (baseLeft + baseWidth);
        const minY = boundaryMargin - baseTop;
        const maxY = window.innerHeight - boundaryMargin - (baseTop + baseHeight);

        nextX = Math.min(Math.max(nextX, minX), maxX);
        nextY = Math.min(Math.max(nextY, minY), maxY);

        setOffset({ x: nextX, y: nextY });
      }
    },
    [boundaryMargin]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const info = dragInfoRef.current;
      if (!info.isDown) return;

      info.isDown = false;
      const el = elementRef.current;
      if (el) {
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }

      if (info.hasMoved) {
        if (storageKey && typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(storageKey, JSON.stringify(offset));
          } catch {
            // ignore
          }
        }

        // Brief delay before unsetting hasMoved so click events are suppressed
        setTimeout(() => {
          setIsDragging(false);
          info.hasMoved = false;
        }, 60);
      } else {
        setIsDragging(false);
      }
    },
    [offset, storageKey]
  );

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    // If a drag occurred, cancel the click/navigation
    if (dragInfoRef.current.hasMoved || isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [isDragging]);

  const style: React.CSSProperties = {
    transform:
      offset.x !== 0 || offset.y !== 0
        ? `translate3d(${offset.x}px, ${offset.y}px, 0)`
        : undefined,
    touchAction: 'none',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: isDragging ? 'none' : undefined,
    transition: isDragging ? 'none' : 'box-shadow 0.25s ease, background 0.25s ease',
  };

  return {
    ref: elementRef,
    style,
    offset,
    isDragging,
    props: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      onClickCapture: handleClickCapture,
    },
  };
}

export default useDraggableFloating;
