"use client";

import { useState } from "react";
import { Check, X, Star, GripVertical, Pencil, MessageSquare, Plus } from "lucide-react";
import type { WatchModel, WatchVariant, Reaction } from "@/types/watch";
import type { DragHandleProps } from "@/components/SortableList";
import { InlineNote } from "@/components/InlineNote";
import { cn } from "@/lib/utils";

interface VariantLineProps {
  variant: WatchVariant;
  isTopPick: boolean;
  onReact: (reaction: Reaction | null) => void;
  onToggleTopPick: () => void;
  onSaveNotes: (notes: string) => void;
}

function IconToggle({
  active,
  onClick,
  title,
  activeClass,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  activeClass: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={cn(
        "w-7 h-7 flex items-center justify-center border transition-colors flex-shrink-0",
        active ? activeClass : "border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-300"
      )}
    >
      {children}
    </button>
  );
}

function VariantLine({ variant, isTopPick, onReact, onToggleTopPick, onSaveNotes }: VariantLineProps) {
  const isPassed = variant.reaction === "pass";
  const isPreferred = variant.reaction === "preferred";
  const [editing, setEditing] = useState(false);
  const notes = variant.notes ?? "";

  return (
    <div className={cn("py-0.5", isPassed && "opacity-40")}>
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <IconToggle
          active={isPreferred}
          onClick={() => onReact(isPreferred ? null : "preferred")}
          title="Preferred"
          activeClass="bg-emerald-500/15 border-emerald-500/60 text-emerald-400"
        >
          <Check size={13} strokeWidth={2.5} />
        </IconToggle>
        <IconToggle
          active={isPassed}
          onClick={() => onReact(isPassed ? null : "pass")}
          title="Pass"
          activeClass="bg-zinc-800 border-zinc-600 text-zinc-300"
        >
          <X size={13} strokeWidth={2.5} />
        </IconToggle>
        <IconToggle
          active={isTopPick}
          onClick={onToggleTopPick}
          title="Top pick"
          activeClass="bg-[#b8973a]/15 border-[#b8973a]/60 text-[#b8973a]"
        >
          <Star size={12} className={isTopPick ? "fill-[#b8973a]" : undefined} />
        </IconToggle>
      </div>

      <p className="min-w-0 flex-1 text-[11px] leading-snug" style={{ fontFamily: "var(--font-mono)" }}>
        {variant.link ? (
          <a
            href={variant.link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-zinc-300 hover:text-[#b8973a] transition-colors underline underline-offset-2 decoration-zinc-700",
              isPassed && "line-through"
            )}
          >
            {variant.reference}
          </a>
        ) : (
          <span className={cn("text-zinc-300", isPassed && "line-through")}>{variant.reference}</span>
        )}
        {variant.label && <span className="text-zinc-500"> · {variant.label}</span>}
      </p>

      <button
        type="button"
        onClick={() => setEditing((e) => !e)}
        title={notes ? "Edit comment" : "Add comment"}
        aria-label={notes ? "Edit comment" : "Add comment"}
        className={cn(
          "p-1 flex-shrink-0 transition-colors",
          notes ? "text-[#b8973a]/80 hover:text-[#b8973a]" : "text-zinc-700 hover:text-zinc-300"
        )}
      >
        <MessageSquare size={12} className={notes ? "fill-[#b8973a]/20" : undefined} />
      </button>
    </div>

    {/* Comment: indented under the reference text (3 toggles × 28px + gaps) */}
    {(editing || notes) && (
      <div className="pl-[100px] pr-6 mt-1">
        {editing ? (
          <InlineNote
            value={notes}
            placeholder="Comment on this variant…"
            onSave={onSaveNotes}
            onClose={() => setEditing(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-left text-[11px] text-[#FAF6EE]/55 italic leading-snug hover:text-[#FAF6EE]/80 transition-colors"
          >
            {notes}
          </button>
        )}
      </div>
    )}
    </div>
  );
}

interface WatchRowProps {
  model: WatchModel;
  rank: number | null;
  onEdit: () => void;
  onUpdateVariant: (variantId: string, reaction: Reaction | null) => void;
  onSetTopPick: (variantId: string | null) => void;
  onUpdateVariantNotes: (variantId: string, notes: string) => void;
  onUpdateNotes: (notes: string) => void;
  dragHandle?: DragHandleProps;
  isDragging?: boolean;
}

export function WatchRow({
  model,
  rank,
  onEdit,
  onUpdateVariant,
  onSetTopPick,
  onUpdateVariantNotes,
  onUpdateNotes,
  dragHandle,
  isDragging,
}: WatchRowProps) {
  const [showPassed, setShowPassed] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);

  const order = (v: WatchVariant) => {
    if (v.id === model.topPickVariantId) return 0;
    if (v.reaction === "preferred") return 1;
    if (v.reaction === null) return 2;
    return 3;
  };
  const sorted = [...model.variants].sort((a, b) => order(a) - order(b));
  const active = sorted.filter((v) => v.reaction !== "pass");
  const passed = sorted.filter((v) => v.reaction === "pass");
  const visible = showPassed ? sorted : active;

  return (
    <div className={cn("bg-black border-b border-zinc-900 py-2.5 pr-3", isDragging && "bg-zinc-950", !dragHandle && "pl-3")}>
      {/* Header line */}
      <div className="flex items-center gap-2">
        {dragHandle && (
          <button
            type="button"
            {...dragHandle}
            aria-label="Drag to reorder"
            className="pl-1.5 pr-0.5 py-1 text-zinc-600 hover:text-zinc-300 flex-shrink-0"
          >
            <GripVertical size={14} />
          </button>
        )}
        {rank !== null && (
          <span
            className="text-[11px] text-[#b8973a] tabular-nums w-5 text-right flex-shrink-0"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {rank}
          </span>
        )}
        <button type="button" onClick={onEdit} className="min-w-0 flex-1 flex items-baseline gap-2 text-left">
          <span
            className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 flex-shrink-0"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {model.brand}
          </span>
          <span
            className="text-[15px] font-light text-[#FAF6EE] leading-tight truncate"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {model.name}
          </span>
        </button>
        <button
          type="button"
          onClick={onEdit}
          title="Notes & variants"
          aria-label="Notes & variants"
          className="text-zinc-600 hover:text-[#b8973a] transition-colors p-1 flex-shrink-0"
        >
          <Pencil size={13} />
        </button>
      </div>

      {/* Variants */}
      <div className={cn("mt-1.5 space-y-1", dragHandle ? "pl-[46px]" : rank !== null ? "pl-7" : "")}>
        {visible.map((v) => (
          <VariantLine
            key={v.id}
            variant={v}
            isTopPick={model.topPickVariantId === v.id}
            onReact={(reaction) => onUpdateVariant(v.id, reaction)}
            onToggleTopPick={() => {
              if (model.topPickVariantId === v.id) return onSetTopPick(null);
              // Starring implies preferred.
              if (v.reaction !== "preferred") onUpdateVariant(v.id, "preferred");
              onSetTopPick(v.id);
            }}
            onSaveNotes={(notes) => onUpdateVariantNotes(v.id, notes)}
          />
        ))}

        {/* General comment for the whole watch */}
        {editingNotes ? (
          <div className="pt-1">
            <InlineNote
              value={model.notes}
              placeholder="General comment on this watch…"
              onSave={onUpdateNotes}
              onClose={() => setEditingNotes(false)}
            />
          </div>
        ) : model.notes ? (
          <button
            type="button"
            onClick={() => setEditingNotes(true)}
            className="block w-full text-left mt-1 pl-2 border-l border-[#b8973a]/30 text-[11px] text-[#FAF6EE]/55 italic leading-snug hover:text-[#FAF6EE]/80 transition-colors"
          >
            {model.notes}
          </button>
        ) : null}

        <div className="flex items-baseline gap-4 pt-0.5">
          {!model.notes && !editingNotes && (
            <button
              type="button"
              onClick={() => setEditingNotes(true)}
              className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Plus size={10} />
              General comment
            </button>
          )}
          {passed.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPassed((s) => !s)}
              className="text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {showPassed ? "Hide passed" : `${passed.length} passed`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
