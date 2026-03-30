'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useDashboardStore from '@/lib/store';
import { getTheme } from '@/lib/themes';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WidgetWrapperProps {
  /** Widget display name shown in the title bar */
  title: string;
  /** Widget content */
  children?: React.ReactNode;
  /** Extra Tailwind/CSS classes on the outer wrapper */
  className?: string;
  /** Show a collapse toggle in the title bar */
  collapsible?: boolean;
  /** Override the card style class (defaults to theme cardStyle) */
  cardStyleOverride?: string;
}

// ---------------------------------------------------------------------------
// Card style class map
// ---------------------------------------------------------------------------

const CARD_STYLE_CLASS: Record<string, string> = {
  holographic: 'glass-card glass-card--holographic',
  ornate:      'glass-card glass-card--ornate',
  stark:       'glass-card glass-card--stark',
  neon:        'glass-card glass-card--neon',
  comic:       'glass-card glass-card--comic',
  tech:        'glass-card glass-card--tech',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WidgetWrapper({
  title,
  children,
  className = '',
  collapsible = false,
  cardStyleOverride,
}: WidgetWrapperProps) {
  const [collapsed, setCollapsed] = useState(false);
  const themeId = useDashboardStore((state) => state.themeId);
  const theme = getTheme(themeId);

  const cardStyleKey = cardStyleOverride ?? theme.cardStyle;
  const cardClass = CARD_STYLE_CLASS[cardStyleKey] ?? 'glass-card';

  return (
    <motion.div
      className={`${cardClass} theme-transition flex flex-col overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      layout
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b theme-transition select-none"
        style={{ borderColor: 'var(--card-border)' }}
      >
        <h3
          className="text-sm font-semibold tracking-wide uppercase"
          style={{ color: 'var(--accent)' }}
        >
          {title}
        </h3>

        {collapsible && (
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="w-6 h-6 flex items-center justify-center rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            style={{ color: 'var(--text-secondary)' }}
            aria-expanded={!collapsed}
            aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
          >
            <motion.span
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className="block text-xs leading-none"
              aria-hidden="true"
            >
              v
            </motion.span>
          </button>
        )}
      </div>

      {/* Body */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="widget-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-1 overflow-hidden"
          >
            <div className="p-4" style={{ color: 'var(--text)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
