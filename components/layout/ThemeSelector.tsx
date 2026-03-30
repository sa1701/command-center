'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes, type Theme } from '@/lib/themes';
import useDashboardStore from '@/lib/store';

// ---------------------------------------------------------------------------
// Color swatch strip
// ---------------------------------------------------------------------------

function ColorSwatches({ colors }: { colors: Theme['colors'] }) {
  const swatchColors = [
    colors.accent,
    colors.accentSecondary,
    colors.danger,
    colors.text,
  ];

  return (
    <div className="flex gap-1 mt-2">
      {swatchColors.map((color, i) => (
        <span
          key={i}
          className="w-4 h-4 rounded-full border border-white/10 flex-shrink-0"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Individual theme card
// ---------------------------------------------------------------------------

interface ThemeCardProps {
  theme: Theme;
  isActive: boolean;
  onSelect: (id: string) => void;
}

function ThemeCard({ theme, isActive, onSelect }: ThemeCardProps) {
  return (
    <motion.button
      onClick={() => onSelect(theme.id)}
      className="w-full text-left p-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      style={{
        backgroundColor: theme.colors.cardBg,
        borderColor: isActive ? theme.colors.accent : theme.colors.cardBorder,
        boxShadow: isActive
          ? `0 0 12px ${theme.colors.accent}55, 0 0 24px ${theme.colors.accent}22`
          : 'none',
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      aria-pressed={isActive}
      aria-label={`Select ${theme.name} theme`}
    >
      {/* Mini bg preview strip */}
      <div
        className="w-full h-8 rounded-md mb-2 overflow-hidden relative"
        style={{ backgroundColor: theme.colors.bg }}
      >
        <div
          className="absolute inset-y-0 left-0 w-1/3"
          style={{ backgroundColor: theme.colors.bgSecondary }}
        />
        <div
          className="absolute top-1 left-2 right-2 h-1.5 rounded-full opacity-70"
          style={{ backgroundColor: theme.colors.accent }}
        />
        <div
          className="absolute bottom-1 left-2 w-1/2 h-1 rounded-full opacity-40"
          style={{ backgroundColor: theme.colors.accentSecondary }}
        />
      </div>

      <p
        className="text-sm font-semibold leading-tight"
        style={{ color: isActive ? theme.colors.accent : theme.colors.text, fontFamily: `'${theme.font}', sans-serif` }}
      >
        {theme.name}
      </p>
      <p
        className="text-xs mt-0.5 leading-snug line-clamp-2"
        style={{ color: theme.colors.textSecondary }}
      >
        {theme.description}
      </p>

      <ColorSwatches colors={theme.colors} />

      {isActive && (
        <span
          className="mt-2 inline-block text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
          style={{ backgroundColor: `${theme.colors.accent}22`, color: theme.colors.accent }}
        >
          Active
        </span>
      )}
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// ThemeSelector modal
// ---------------------------------------------------------------------------

interface ThemeSelectorProps {
  /** Render prop for the trigger element so consumers control the button style */
  trigger?: React.ReactNode;
}

export default function ThemeSelector({ trigger }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const themeId = useDashboardStore((state) => state.themeId);
  const setTheme = useDashboardStore((state) => state.setTheme);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleSelect = useCallback(
    (id: string) => {
      setTheme(id);
      // Small delay to let the user see the selection before closing
      setTimeout(close, 250);
    },
    [setTheme, close]
  );

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  // Trap scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Trigger */}
      <div onClick={open} className="cursor-pointer">
        {trigger ?? (
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-sm font-medium border theme-transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              color: 'var(--accent)',
            }}
            aria-label="Open theme selector"
          >
            Themes
          </button>
        )}
      </div>

      {/* Modal backdrop + panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              aria-hidden="true"
            />

            {/* Modal panel */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Theme selector"
              className="fixed z-50 inset-x-4 top-[50%] max-w-2xl mx-auto rounded-2xl border p-6 shadow-2xl theme-transition"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--card-border)',
                transform: 'translateY(-50%)',
              }}
              initial={{ opacity: 0, scale: 0.92, y: '-44%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%' }}
              exit={{ opacity: 0, scale: 0.92, y: '-44%' }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2
                    className="text-xl font-bold glow-accent"
                    style={{ color: 'var(--accent)' }}
                  >
                    Choose Theme
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    Select your Command Center aesthetic
                  </p>
                </div>
                <button
                  onClick={close}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  style={{
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-secondary)',
                  }}
                  aria-label="Close theme selector"
                >
                  x
                </button>
              </div>

              {/* Theme grid — 3 columns on sm+, 2 on xs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {themes.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isActive={theme.id === themeId}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
