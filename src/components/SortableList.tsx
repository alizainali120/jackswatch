"use client";

import { useEffect, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";

export interface DragHandleProps {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  style: React.CSSProperties;
}

interface DragState {
  fromIndex: number;
  overIndex: number;
  startPageY: number;
  startClientY: number;
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

export function SortableList<T>({ items, getId, onReorder, renderItem, className }: SortableListProps<T>) {
  // `start` is set once when a drag begins; `drag` is the live position used for rendering.
  const [start, setStart] = useState<DragState | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  useEffect(() => {
    if (!start) return;

    let current = start;
    let lastClientY = start.startClientY;

    const update = () => {
      const dy = lastClientY + window.scrollY - current.startPageY;
      current = { ...current, dy, overIndex: computeOver(current, dy) };
      setDrag(current);
    };

    let raf = 0;
    const tick = () => {
      const y = lastClientY;
      let speed = 0;
      if (y < EDGE) speed = -MAX_SCROLL_SPEED * (1 - y / EDGE);
      else if (y > window.innerHeight - EDGE) speed = MAX_SCROLL_SPEED * (1 - (window.innerHeight - y) / EDGE);
      if (speed !== 0) {
        window.scrollBy(0, speed);
        update();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: PointerEvent) => {
      lastClientY = e.clientY;
      update();
    };
    const onUp = () => {
      setStart(null);
      setDrag(null);
      if (current.overIndex !== current.fromIndex) {
        const ids = items.map(getId);
        const [moved] = ids.splice(current.fromIndex, 1);
        ids.splice(current.overIndex, 0, moved);
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
    // Bind once per drag; items/handlers are stable for its duration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  function startDrag(index: number, e: ReactPointerEvent<HTMLElement>) {
    if (e.button !== 0) return;
    e.preventDefault();
    const list = e.currentTarget.closest("[data-sortable-list]");
    if (!list) return;
    const rects = Array.from(list.querySelectorAll(":scope > [data-sortable-item]")).map((el) =>
      el.getBoundingClientRect()
    );
    const d: DragState = {
      fromIndex: index,
      overIndex: index,
      startPageY: e.clientY + window.scrollY,
      startClientY: e.clientY,
      dy: 0,
      tops: rects.map((r) => r.top + window.scrollY),
      heights: rects.map((r) => r.height),
    };
    setStart(d);
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
    <div data-sortable-list className={className} style={drag ? { userSelect: "none" } : undefined}>
      {items.map((item, i) => {
        const isDragging = drag?.fromIndex === i;
        return (
          <div
            key={getId(item)}
            data-sortable-item
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
