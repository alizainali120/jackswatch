"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { WatchModel, Reaction } from "@/types/watch";
import { WatchRow } from "@/components/WatchRow";
import { cn } from "@/lib/utils";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Watch as WatchIcon, Share2, Loader2, AlertCircle, GripVertical } from "lucide-react";
import Link from "next/link";

function SortableWatchRow({
  model,
  isReordering,
  onUpdateVariant,
  onSetTopPick,
  onUpdateNotes,
  onUpdateReactionTags,
}: {
  model: WatchModel;
  isReordering: boolean;
  onUpdateVariant: (variantId: string, reaction: Reaction | null) => void;
  onSetTopPick: (variantId: string | null) => void;
  onUpdateNotes: (notes: string) => void;
  onUpdateReactionTags: (tags: string[]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: model.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <WatchRow
      model={model}
      isReordering={isReordering}
      isDragging={isDragging}
      dragRef={setNodeRef}
      dragStyle={style}
      dragHandleProps={{ ...attributes, ...listeners }}
      onUpdateVariant={onUpdateVariant}
      onSetTopPick={onSetTopPick}
      onUpdateNotes={onUpdateNotes}
      onUpdateReactionTags={onUpdateReactionTags}
    />
  );
}

export function AppClient() {
  const [models, setModels] = useState<WatchModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const variantTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    fetch("/api/watches")
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<WatchModel[]>;
      })
      .then((data) => { setModels(data); setLoading(false); })
      .catch((err) => {
        console.error(err);
        setError("Couldn't reach the server.");
        setLoading(false);
      });
  }, []);

  const handleUpdateVariant = useCallback(
    (modelId: string, variantId: string, reaction: Reaction | null) => {
      setModels((prev) =>
        prev.map((m) =>
          m.id !== modelId
            ? m
            : { ...m, variants: m.variants.map((v) => v.id === variantId ? { ...v, reaction } : v) }
        )
      );
      const existing = variantTimers.current.get(variantId);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(async () => {
        variantTimers.current.delete(variantId);
        setSaving(true);
        try {
          await fetch(`/api/variants/${variantId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reaction }),
          });
        } catch (err) { console.error("Variant save failed:", err); }
        finally { setSaving(false); }
      }, 600);
      variantTimers.current.set(variantId, timer);
    },
    []
  );

  const handleSetTopPick = useCallback(async (modelId: string, variantId: string | null) => {
    setModels((prev) =>
      prev.map((m) => m.id === modelId ? { ...m, topPickVariantId: variantId } : m)
    );
    setSaving(true);
    try {
      await fetch(`/api/watches/${modelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topPickVariantId: variantId }),
      });
    } catch (err) { console.error("Top pick save failed:", err); }
    finally { setSaving(false); }
  }, []);

  const handleUpdateNotes = useCallback(async (modelId: string, notes: string) => {
    setModels((prev) => prev.map((m) => m.id === modelId ? { ...m, notes } : m));
    setSaving(true);
    try {
      await fetch(`/api/watches/${modelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
    } catch (err) { console.error("Notes save failed:", err); }
    finally { setSaving(false); }
  }, []);

  const handleUpdateReactionTags = useCallback(async (modelId: string, reactionTags: string[]) => {
    setModels((prev) => prev.map((m) => m.id === modelId ? { ...m, reactionTags } : m));
    setSaving(true);
    try {
      await fetch(`/api/watches/${modelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactionTags }),
      });
    } catch (err) { console.error("Tags save failed:", err); }
    finally { setSaving(false); }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setModels((prev) => {
      const oldIdx = prev.findIndex((m) => m.id === active.id);
      const newIdx = prev.findIndex((m) => m.id === over.id);
      const reordered = arrayMove(prev, oldIdx, newIdx);
      // Save ranks asynchronously
      setSaving(true);
      fetch("/api/watches/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: reordered.map((m) => m.id) }),
      })
        .catch((err) => console.error("Rank save failed:", err))
        .finally(() => setSaving(false));
      return reordered;
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex items-center gap-3 text-zinc-600">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-xs tracking-widest uppercase">Loading</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#FAF6EE]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-sm border-b border-zinc-800/50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#b8973a]/15 border border-[#b8973a]/30 flex items-center justify-center flex-shrink-0">
              <WatchIcon size={11} className="text-[#b8973a]" />
            </div>
            <span
              className="text-xs font-semibold tracking-widest uppercase text-zinc-100"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Jack&apos;s Watch Guide
            </span>
          </div>

          <div className="flex items-center gap-2">
            {saving && (
              <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                <Loader2 size={10} className="animate-spin" />
                Saving
              </span>
            )}

            {/* Reorder toggle */}
            <button
              onClick={() => setIsReordering((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all",
                isReordering
                  ? "bg-[#b8973a]/15 border-[#b8973a]/40 text-[#b8973a]"
                  : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
              )}
            >
              <GripVertical size={12} />
              Reorder
            </button>

            <Link
              href="/summary"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#b8973a]/10 border border-[#b8973a]/20 text-[#b8973a] text-xs font-medium hover:bg-[#b8973a]/20 transition-colors"
            >
              <Share2 size={12} />
              Summary
            </Link>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle size={13} />
            {error}
          </div>
        </div>
      )}

      {/* Page title */}
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-4">
        <h1
          className="text-4xl font-light tracking-[0.2em] uppercase text-[#FAF6EE]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The Collection
        </h1>
      </div>

      {/* Watch rows */}
      <main className="max-w-2xl mx-auto">
        {models.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-600 text-sm">No watches yet.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={models.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              {models.map((model) => (
                <SortableWatchRow
                  key={model.id}
                  model={model}
                  isReordering={isReordering}
                  onUpdateVariant={(variantId, reaction) =>
                    handleUpdateVariant(model.id, variantId, reaction)
                  }
                  onSetTopPick={(variantId) => handleSetTopPick(model.id, variantId)}
                  onUpdateNotes={(notes) => handleUpdateNotes(model.id, notes)}
                  onUpdateReactionTags={(tags) => handleUpdateReactionTags(model.id, tags)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </main>
    </div>
  );
}
