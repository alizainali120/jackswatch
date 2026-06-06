"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Watch } from "@/types/watch";
import { cn, getBrandGradient } from "@/lib/utils";
import { GripVertical, Trophy, Star } from "lucide-react";

interface Props {
  watches: Watch[];
  onReorder: (watches: Watch[]) => void;
  onNotesClick: (watch: Watch) => void;
}

interface RowProps {
  watch: Watch;
  index: number;
  onNotesClick: () => void;
}

function SortableRow({ watch, index, onNotesClick }: RowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: watch.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const thumb =
    watch.notes?.wristPhoto || (watch.image ? watch.image : null);
  const hasScores =
    (watch.notes?.fitScore ?? 0) > 0 || (watch.notes?.dialScore ?? 0) > 0;

  const avgScore =
    hasScores
      ? (
          ((watch.notes?.fitScore ?? 0) + (watch.notes?.dialScore ?? 0)) /
          2
        ).toFixed(1)
      : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all",
        isDragging
          ? "opacity-40 bg-zinc-800"
          : index === 0
          ? "bg-[#b8973a]/8 border border-[#b8973a]/20"
          : "hover:bg-zinc-800/50"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-zinc-700 hover:text-zinc-500 cursor-grab active:cursor-grabbing touch-none p-0.5"
        aria-label="Reorder"
      >
        <GripVertical size={14} />
      </button>

      {/* Rank */}
      <div className="w-5 flex-shrink-0 text-center">
        {index === 0 ? (
          <Trophy size={13} className="text-[#b8973a] mx-auto" />
        ) : (
          <span className="text-[11px] font-bold text-zinc-500">
            {index + 1}
          </span>
        )}
      </div>

      {/* Thumbnail */}
      <div
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-br",
          getBrandGradient(watch.brand)
        )}
      >
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/20 text-xs font-thin">
              {watch.brand[0]}
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-zinc-200 truncate">{watch.name}</p>
        <p className="text-[10px] text-zinc-500 truncate">{watch.brand}</p>
      </div>

      {/* Score */}
      {avgScore !== null ? (
        <div className="flex-shrink-0 flex items-center gap-1">
          <Star size={10} className="text-[#b8973a]" />
          <span className="text-[11px] font-semibold text-[#b8973a] tabular-nums">
            {avgScore}
          </span>
        </div>
      ) : (
        <button
          onClick={onNotesClick}
          className="flex-shrink-0 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Rate
        </button>
      )}
    </div>
  );
}

export function RankingView({ watches, onReorder, onNotesClick }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sorted = [...watches].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((w) => w.id === active.id);
    const newIndex = sorted.findIndex((w) => w.id === over.id);
    onReorder(
      arrayMove(sorted, oldIndex, newIndex).map((w, i) => ({
        ...w,
        rank: i + 1,
      }))
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-zinc-700 text-xs">No watches to rank.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={13} className="text-[#b8973a]" />
          <span className="text-xs font-semibold text-zinc-300 tracking-wide">
            Leaderboard
          </span>
        </div>
        <span className="text-[10px] text-zinc-500">drag to reorder</span>
      </div>

      {/* List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sorted.map((w) => w.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="px-2 py-2 space-y-0.5">
            {sorted.map((watch, index) => (
              <SortableRow
                key={watch.id}
                watch={watch}
                index={index}
                onNotesClick={() => onNotesClick(watch)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
