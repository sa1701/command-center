'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePomodoroStore } from '@/lib/widget-store';
import useDashboardStore from '@/lib/store';
import { themes } from '@/lib/themes';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CommandAction {
  id: string;
  label: string;
  category: string;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Fuzzy match helper
// ---------------------------------------------------------------------------

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build actions list
  const actions: CommandAction[] = useMemo(() => {
    const items: CommandAction[] = [
      // Navigation
      { id: 'focus-todo', label: 'Focus Todo Input', category: 'Navigate', shortcut: 'T', action: () => { document.querySelector<HTMLInputElement>('[aria-label="New todo text"]')?.focus(); } },
      { id: 'focus-notes', label: 'Focus Quick Notes', category: 'Navigate', shortcut: 'N', action: () => { document.querySelector<HTMLTextAreaElement>('[aria-label="Quick notes textarea"]')?.focus(); } },
      { id: 'scroll-top', label: 'Scroll to Top', category: 'Navigate', action: () => { window.scrollTo({ top: 0, behavior: 'smooth' }); } },

      // Actions
      { id: 'toggle-focus', label: 'Toggle Focus Mode', category: 'Action', shortcut: 'F', action: () => { useDashboardStore.getState().toggleFocusMode(); } },
      { id: 'start-pomodoro', label: 'Start / Pause Pomodoro', category: 'Action', shortcut: 'Space', action: () => { const p = usePomodoroStore.getState(); if (p.isRunning) { p.pause(); } else { p.start(); } } },
      { id: 'reset-pomodoro', label: 'Reset Pomodoro Timer', category: 'Action', action: () => { usePomodoroStore.getState().reset(); } },

      // Themes
      ...themes.map((t) => ({
        id: `theme-${t.id}`,
        label: `Theme: ${t.name}`,
        category: 'Theme',
        action: () => { useDashboardStore.getState().setTheme(t.id); },
      })),

      // Widgets - scroll to
      ...['Clock', 'Timetable', 'Todo List', 'Pomodoro Timer', 'Workout Tracker', 'Prayer Times',
          'Nutrition Tracker', 'Calendar', 'Habit Tracker', 'Project Progress', 'Grade Tracker',
          'Weather', 'GitHub Activity', 'Bookmarks', 'Quick Notes'].map(w => ({
        id: `goto-${w.toLowerCase().replace(/\s/g, '-')}`,
        label: `Go to ${w}`,
        category: 'Widget',
        action: () => {
          const el = document.querySelector(`[data-widget-title="${w}"]`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        },
      })),
    ];
    return items;
  }, []);

  // Filter actions
  const filtered = useMemo(() => {
    if (!query.trim()) return actions;
    return actions.filter(a => fuzzyMatch(query, a.label) || fuzzyMatch(query, a.category));
  }, [query, actions]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keep selected in bounds
  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[selectedIdx] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx]);

  const runAction = useCallback((action: CommandAction) => {
    onClose();
    // Small delay so the modal closes before the action runs
    setTimeout(() => action.action(), 100);
  }, [onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIdx(i => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIdx(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[selectedIdx]) runAction(filtered[selectedIdx]);
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filtered, selectedIdx, runAction, onClose]);

  // Group actions by category
  const grouped = useMemo(() => {
    const groups: Record<string, CommandAction[]> = {};
    for (const a of filtered) {
      (groups[a.category] ??= []).push(a);
    }
    return groups;
  }, [filtered]);

  let flatIdx = 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative glass-card w-full max-w-lg overflow-hidden"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--card-border)' }}
            onClick={e => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--card-border)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type a command..."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--text)' }}
                aria-label="Command palette search"
              />
              <kbd
                className="px-1.5 py-0.5 rounded text-[10px] font-mono border"
                style={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[300px] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <p className="text-center py-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No commands found
                </p>
              ) : (
                Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      {category}
                    </p>
                    {items.map((action) => {
                      const idx = flatIdx++;
                      const isSelected = idx === selectedIdx;
                      return (
                        <button
                          key={action.id}
                          className="w-full flex items-center justify-between px-4 py-2 text-sm transition-colors"
                          style={{
                            color: isSelected ? 'var(--accent)' : 'var(--text)',
                            backgroundColor: isSelected ? 'rgba(245, 166, 35, 0.1)' : 'transparent',
                          }}
                          onClick={() => runAction(action)}
                          onMouseEnter={() => setSelectedIdx(idx)}
                        >
                          <span>{action.label}</span>
                          {action.shortcut && (
                            <kbd
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono border"
                              style={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
                            >
                              {action.shortcut}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-4 py-2 border-t text-[10px]"
              style={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
            >
              <span>{filtered.length} commands</span>
              <div className="flex items-center gap-2">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
