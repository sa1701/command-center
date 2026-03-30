'use client';

import { useEffect, useRef, useState } from 'react';
import { useNotesStore } from '@/lib/widget-store';

// ---------------------------------------------------------------------------
// QuickNotes Widget
// Auto-saves content to Zustand/localStorage after a 500 ms debounce.
// ---------------------------------------------------------------------------

const DEBOUNCE_MS = 500;

export default function QuickNotes() {
  const { content, setContent } = useNotesStore();
  const [local, setLocal] = useState(content);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saved, setSaved] = useState(true);

  // Keep local in sync when store hydrates from localStorage
  useEffect(() => {
    setLocal(content);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setLocal(val);
    setSaved(false);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setContent(val);
      setSaved(true);
    }, DEBOUNCE_MS);
  }

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const charCount = local.length;

  return (
    <div className="flex flex-col h-full">
      <textarea
        className="flex-1 w-full resize-none bg-transparent font-mono text-sm leading-relaxed p-1 outline-none placeholder-opacity-40 min-h-[160px]"
        style={{
          color: 'var(--text)',
          caretColor: 'var(--accent)',
        }}
        placeholder="Type your notes here..."
        value={local}
        onChange={handleChange}
        aria-label="Quick notes textarea"
        spellCheck
      />

      <div
        className="flex items-center justify-between pt-2 border-t text-xs"
        style={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
      >
        <span>{charCount.toLocaleString()} characters</span>
        <span
          className="transition-opacity duration-300"
          style={{ opacity: saved ? 1 : 0.4 }}
          aria-live="polite"
          aria-label={saved ? 'Notes saved' : 'Saving notes'}
        >
          {saved ? 'Saved' : 'Saving...'}
        </span>
      </div>
    </div>
  );
}
