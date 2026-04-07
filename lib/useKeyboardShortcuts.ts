'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePomodoroStore } from '@/lib/widget-store';
import useDashboardStore from '@/lib/store';

export default function useKeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl+K opens command palette regardless of focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setShowCommandPalette((prev) => !prev);
      return;
    }

    // Don't intercept when typing in inputs
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    switch (e.key) {
      case ' ': {
        e.preventDefault();
        const pomo = usePomodoroStore.getState();
        if (pomo.isRunning) pomo.pause();
        else pomo.start();
        break;
      }
      case 't':
      case 'T': {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('[aria-label="New todo text"]');
        input?.focus();
        break;
      }
      case 'n':
      case 'N': {
        e.preventDefault();
        const textarea = document.querySelector<HTMLTextAreaElement>('[aria-label="Quick notes textarea"]');
        textarea?.focus();
        break;
      }
      case '?': {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        break;
      }
      case 'f':
      case 'F': {
        e.preventDefault();
        useDashboardStore.getState().toggleFocusMode();
        break;
      }
      case 'Escape': {
        setShowHelp(false);
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { showHelp, setShowHelp, showCommandPalette, setShowCommandPalette };
}
