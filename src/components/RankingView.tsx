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
import type { Watch, WatchTier } from "@/types/watch";
import {
  cn,
  formatPrice,
  STYLE_COLORS,
  STYLE_LABELS,
  TIER_COLORS,
  TIER_LABELS,
  getBrandGradient,
} from "@/lib/utils";
import { GripVertical, MessageSquare, Camera } from "lucide-react";
import { useRef, useState } from "react";
import { compressImage } from "@/lib/storage";

interface Props {
  watches: Watch[];
  onReorder: (watches: Watch[]) => void;
  onWatchClick: (watch: Watch) => void;
  onWatchUpdate: (watch: Watch) => void;
}

interface RowProps {
  watch: Watch;
  index: number;
  onClick: () => void;
  onUpdate: (watch: Watch) => void;
}

const TIERS: WatchTier[] = ["must-have", "consider", "maybe", "pass"];

function SortableRow({ watch, index, onClick, onUpdate }: RowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: watch.id });
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const thumb =
    watch.wristPhotos[0] ?? watch.stockPhotos[0] ?? null;

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      onUpdate({ ...watch, wristPhotos: [...watch.wristPhotos, compressed] });
    } catch {
      console.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3 group transition-all",
        isDragging
          ? "opacity-50 border-zinc-600 shadow-xl"
          : "hover:border-zinc-700"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 text-zinc-700 hover:text-zinc-500 cursor-grab active:cursor-grabbing touch-none p-1"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>

      {/* Rank number */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
        <span className="text-[11px] font-bold text-[#b8973a]">
          {index + 1}
        </span>
      </div>

      {/* Thumbnail */}
      <div
        className={cn(
          "flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden cursor-pointer",
          `bg-gradient-to-br ${getBrandGradient(watch.brand)}`
        )}
        onClick={onClick}
      >
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={watch.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/20 text-sm font-thin">
              {watch.brand[0]}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] tracking-widest uppercase text-zinc-500">
            {watch.brand}
          </span>
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full border",
              STYLE_COLORS[watch.style]
            )}
          >
            {STYLE_LABELS[watch.style]}
          </span>
        </div>
        <p className="text-sm font-semibold text-zinc-100 truncate">
          {watch.name}
        </p>
        <p className="text-[11px] text-[#b8973a]">{formatPrice(watch.price)}</p>
      </div>

      {/* Tier + actions (desktop) */}
      <div className="flex-shrink-0 hidden sm:flex items-center gap-2">
        <select
          value={watch.tier ?? ""}
          onChange={(e) => {
            const val = e.target.value as WatchTier | "";
            onUpdate({ ...watch, tier: val === "" ? undefined : val });
          }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "text-[11px] rounded-full border px-2 py-0.5 bg-transparent cursor-pointer focus:outline-none",
            watch.tier ? TIER_COLORS[watch.tier] : "border-zinc-700 text-zinc-500"
          )}
        >
          <option value="">No tier</option>
          {TIERS.map((t) => (
            <option key={t} value={t}>
              {TIER_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      {/* Notes indicator */}
      {watch.notes && (
        <div className="flex-shrink-0" title={watch.notes}>
          <MessageSquare size={13} className="text-zinc-600" />
        </div>
      )}

      {/* Upload */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          fileRef.current?.click();
        }}
        className="flex-shrink-0 text-zinc-700 hover:text-zinc-400 transition-colors"
        title="Upload wrist photo"
      >
        <Camera size={14} />
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoUpload}
        disabled={uploading}
      />
    </div>
  );
}

export function RankingView({
  watches,
  onReorder,
  onWatchClick,
  onWatchUpdate,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sorted = [...watches].sort((a, b) => a.rank - b.rank);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sorted.findIndex((w) => w.id === active.id);
    const newIndex = sorted.findIndex((w) => w.id === over.id);
    const newOrder = arrayMove(sorted, oldIndex, newIndex);
    onReorder(newOrder.map((w, i) => ({ ...w, rank: i + 1 })));
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-zinc-600 text-sm">No watches to rank.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-2">
        <h2 className="text-xs text-zinc-600 tracking-widest uppercase">
          Drag to reorder · {watches.length} watches
        </h2>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sorted.map((w) => w.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {sorted.map((watch, index) => (
              <SortableRow
                key={watch.id}
                watch={watch}
                index={index}
                onClick={() => onWatchClick(watch)}
                onUpdate={onWatchUpdate}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
