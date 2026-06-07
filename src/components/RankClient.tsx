"use client";

import { useState, useEffect, useCallback } from "react";
import type { WatchModel } from "@/types/watch";
import { cn, likenessScore, getBrandGradient } from "@/lib/utils";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ArrowLeft, Loader2, Trophy } from "lucide-react";
import Link from "next/link";

function SortableRow({ model, index }: { model: WatchModel; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: model.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const score = likenessScore(model);
  const loved = model.variants.filter((v) => v.reaction === "love");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all",
        isDragging ? "opacity-40 bg-zinc-800" : "bg-zinc-900 border-zinc-800"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-zinc-700 hover:text-zinc-500 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={16} />
      </button>

      {/* Rank */}
      <div className="w-6 text-center flex-shrink-0">
        {index === 0 ? (
          <Trophy size={14} className="text-[#b8973a] mx-auto" />
        ) : (
          <span className="text-[12px] font-bold text-zinc-500">{index + 1}</span>
        )}
      </div>

      {/* Thumb */}
      <div className={cn("w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br flex-shrink-0", getBrandGradient(model.brand))}>
        {model.heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={model.heroImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/20 text-sm font-thin">{model.brand[0]}</span>
          </div>
        )}
      </div>

      {/* Name + loved variants */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-zinc-200 truncate">{model.brand} {model.name}</p>
        {loved.length > 0 && (
          <p className="text-[10px] text-zinc-600 truncate mt-0.5">
            ❤️ {loved.map((v) => v.label).join(", ")}
          </p>
        )}
      </div>

      {/* Score */}
      {score !== null && (
        <span className="text-[11px] font-semibold text-[#b8973a] flex-shrink-0">{score}%</span>
      )}
    </div>
  );
}

export function RankClient() {
  const [models, setModels] = useState<WatchModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/watches")
      .then((r) => r.json())
      .then((data: WatchModel[]) => {
        // Show only models where at least one variant is loved, sorted by likeness
        const withLove = data
          .filter((m) => m.variants.some((v) => v.reaction === "love"))
          .sort((a, b) => (likenessScore(b) ?? 0) - (likenessScore(a) ?? 0));
        setModels(withLove);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setModels((prev) => {
      const oldIdx = prev.findIndex((m) => m.id === active.id);
      const newIdx = prev.findIndex((m) => m.id === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
  }, []);

  async function saveRanking() {
    setSaving(true);
    try {
      await fetch("/api/watches/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: models.map((m) => m.id) }),
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 size={16} className="animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#FAF6EE]">
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft size={13} />
            Collection
          </Link>
          <Link href="/summary" className="text-xs text-zinc-500 hover:text-[#b8973a] transition-colors">
            View Summary →
          </Link>
        </div>

        <h1
          className="text-4xl font-light tracking-[0.2em] uppercase text-[#FAF6EE] mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Final Ranking
        </h1>
        <p className="text-[10px] tracking-widest text-zinc-600 uppercase mb-8">
          Drag to set your final order
        </p>

        {models.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-600 text-sm">No watches loved yet.</p>
            <p className="text-zinc-700 text-xs mt-1">Rate some variants on the collection page first.</p>
            <Link href="/" className="inline-block mt-4 text-xs text-[#b8973a] hover:underline">
              Go to collection →
            </Link>
          </div>
        ) : (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={models.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {models.map((model, index) => (
                    <SortableRow key={model.id} model={model} index={index} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <button
              onClick={saveRanking}
              disabled={saving}
              className="mt-6 w-full py-3 rounded-xl bg-[#b8973a]/10 border border-[#b8973a]/20 text-[#b8973a] text-xs font-semibold tracking-widest uppercase hover:bg-[#b8973a]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              Save Ranking
            </button>
          </>
        )}
      </div>
    </div>
  );
}
