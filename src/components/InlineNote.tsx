"use client";

import { useEffect, useRef, useState } from "react";

interface InlineNoteProps {
  value: string;
  placeholder?: string;
  onSave: (value: string) => void;
  onClose: () => void;
}

/** Auto-growing textarea. Saves on blur or ⌘/Ctrl+Enter, cancels on Escape. */
export function InlineNote({ value, placeholder, onSave, onClose }: InlineNoteProps) {
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  function commit() {
    if (!cancelled.current && draft.trim() !== value.trim()) onSave(draft.trim());
    onClose();
  }

  return (
    <textarea
      ref={ref}
      value={draft}
      rows={1}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          cancelled.current = true;
          ref.current?.blur();
        } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          ref.current?.blur();
        }
      }}
      className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#b8973a]/50 px-2 py-1.5 text-base sm:text-[12px] text-[#FAF6EE] placeholder-zinc-600 focus:outline-none leading-relaxed resize-none overflow-hidden"
      style={{ fontFamily: "var(--font-sans)" }}
    />
  );
}
