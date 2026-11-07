"use client";

import { useEffect, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";

export interface DragHandleProps {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  style: React.CSSProperties;
}

interface DragState {
  fromIndex: number;
  overIndex: number;
  startPageY: number;
  dy: number;
  tops: number[];
  heights: number[];
}

interface SortableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  onReorder: (orderedIds: string[]) => void;
  renderItem: (item: T, index: number, handle: DragHandleProps, isDragging: boolean) => ReactNode;
  className?: string;
}

const EDGE = 72;
const MAX_SCROLL_SPEED = 14;

export function SortableList<T>({ items, getId, onReorder, renderItem, className }: SortableListProps<T>) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const lastClientY = useRef(0);

  function computeOver(d: DragState, dy: number): number {
    const { fromIndex, tops, heights } = d;
    const center = tops[fromIndex] + heights[fromIndex] / 2 + dy;
    let over = fromIndex;
    for (let i = fromIndex + 1; i < tops.length; i++) {
      if (center > tops[i] + heights[i] / 2) over = i;
    }
    for (let i = fromIndex - 1; i >= 0; i--) {
      if (center < tops[i] + heights[i] / 2) over = i;
    }
    return over;
  }

  function update(clientY: number) {
    const d = dragRef.current;
    if (!d) return;
    const dy = clientY + window.scrollY - d.startPageY;
    const next = { ...d, dy, overIndex: computeOver(d, dy) };
    dragRef.current = next;
    setDrag(next);
  }

  useEffect(() => {
    if (!drag) return;

    let raf = 0;
    const tick = () => {
      const y = lastClientY.current;
      let speed = 0;
      if (y < EDGE) speed = -MAX_SCROLL_SPEED * (1 - y / EDGE);
      else if (y > window.innerHeight - EDGE) speed = MAX_SCROLL_SPEED * (1 - (window.innerHeight - y) / EDGE);
      if (speed !== 0) {
        window.scrollBy(0, speed);
        update(y);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: PointerEvent) => {
      lastClientY.current = e.clientY;
      update(e.clientY);
    };
    const onUp = () => {
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (d && d.overIndex !== d.fromIndex) {
        const ids = items.map(getId);
        const [moved] = ids.splice(d.fromIndex, 1);
        ids.splice(d.overIndex, 0, moved);
        onReorder(ids);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    // Re-bind only when a drag starts/ends, not on every move.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag !== null]);

  function startDrag(index: number, e: ReactPointerEvent<HTMLElement>) {
    if (e.button !== 0) return;
    e.preventDefault();
    const rects = itemRefs.current.slice(0, items.length).map((el) => el?.getBoundingClientRect());
    const d: DragState = {
      fromIndex: index,
      overIndex: index,
      startPageY: e.clientY + window.scrollY,
      dy: 0,
      tops: rects.map((r) => (r ? r.top + window.scrollY : 0)),
      heights: rects.map((r) => r?.height ?? 0),
    };
    lastClientY.current = e.clientY;
    dragRef.current = d;
    setDrag(d);
  }

  function offsetFor(i: number): number {
    if (!drag) return 0;
    const { fromIndex, overIndex, dy, heights } = drag;
    if (i === fromIndex) return dy;
    const h = heights[fromIndex];
    if (fromIndex < overIndex && i > fromIndex && i <= overIndex) return -h;
    if (overIndex < fromIndex && i >= overIndex && i < fromIndex) return h;
    return 0;
  }

  return (
    <div className={className} style={drag ? { userSelect: "none" } : undefined}>
      {items.map((item, i) => {
        const isDragging = drag?.fromIndex === i;
        return (
          <div
            key={getId(item)}
            ref={(el) => { itemRefs.current[i] = el; }}
            className={isDragging ? "relative z-20 shadow-[0_8px_30px_rgba(0,0,0,0.8)]" : "relative"}
            style={{
              transform: `translateY(${offsetFor(i)}px)`,
              transition: drag && !isDragging ? "transform 150ms ease" : "none",
            }}
          >
            {renderItem(
              item,
              i,
              { onPointerDown: (e) => startDrag(i, e), style: { touchAction: "none", cursor: drag ? "grabbing" : "grab" } },
              isDragging
            )}
          </div>
        );
      })}
    </div>
  );
}
