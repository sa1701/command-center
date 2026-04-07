'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  /** Unique sortable ID for drag-and-drop */
  sortableId?: string;
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
// CSS @property animation injected once for the shimmer border sweep
// ---------------------------------------------------------------------------

const SHIMMER_STYLE = `
@property --border-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
@keyframes border-spin {
  to { --border-angle: 360deg; }
}
.widget-shimmer-active {
  animation: border-spin 3s linear infinite;
}
`;

// ---------------------------------------------------------------------------
// Corner decoration SVGs per card style
// ---------------------------------------------------------------------------

function HolographicCorners() {
  // Tiny rainbow shimmer dots in top-right and bottom-left corners
  return (
    <>
      {/* Top-right */}
      <svg
        className="absolute top-1.5 right-1.5 pointer-events-none"
        width="10"
        height="10"
        viewBox="0 0 10 10"
        aria-hidden="true"
      >
        <circle cx="2" cy="2" r="1.5" fill="var(--accent)" opacity="0.7" />
        <circle cx="6" cy="2" r="1" fill="var(--accent-secondary)" opacity="0.5" />
        <circle cx="2" cy="6" r="1" fill="var(--accent-secondary)" opacity="0.5" />
        <circle cx="6" cy="6" r="1.5" fill="var(--accent)" opacity="0.3" />
      </svg>
      {/* Bottom-left */}
      <svg
        className="absolute bottom-1.5 left-1.5 pointer-events-none"
        width="10"
        height="10"
        viewBox="0 0 10 10"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="1.5" fill="var(--accent)" opacity="0.7" />
        <circle cx="4" cy="8" r="1" fill="var(--accent-secondary)" opacity="0.5" />
        <circle cx="8" cy="4" r="1" fill="var(--accent-secondary)" opacity="0.5" />
        <circle cx="4" cy="4" r="1.5" fill="var(--accent)" opacity="0.3" />
      </svg>
    </>
  );
}

function OrnateCorners() {
  // Small gold filigree L-shapes in corners
  return (
    <>
      {/* Top-left */}
      <svg
        className="absolute top-1 left-1 pointer-events-none"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        aria-hidden="true"
      >
        <path d="M1 8 L1 1 L8 1" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <circle cx="1" cy="1" r="1" fill="var(--accent)" opacity="0.9" />
      </svg>
      {/* Bottom-right */}
      <svg
        className="absolute bottom-1 right-1 pointer-events-none"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        aria-hidden="true"
      >
        <path d="M11 4 L11 11 L4 11" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <circle cx="11" cy="11" r="1" fill="var(--accent)" opacity="0.9" />
      </svg>
    </>
  );
}

function ComicCorners() {
  // Halftone dot cluster in top-right and bottom-left corners
  return (
    <>
      {/* Top-right */}
      <svg
        className="absolute top-1.5 right-1.5 pointer-events-none"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        aria-hidden="true"
      >
        <circle cx="10" cy="2" r="1.2" fill="var(--accent)" opacity="0.9" />
        <circle cx="6"  cy="2" r="1.0" fill="var(--accent)" opacity="0.6" />
        <circle cx="10" cy="6" r="1.0" fill="var(--accent)" opacity="0.6" />
        <circle cx="6"  cy="6" r="0.8" fill="var(--accent)" opacity="0.3" />
      </svg>
      {/* Bottom-left */}
      <svg
        className="absolute bottom-1.5 left-1.5 pointer-events-none"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        aria-hidden="true"
      >
        <circle cx="2"  cy="10" r="1.2" fill="var(--accent)" opacity="0.9" />
        <circle cx="6"  cy="10" r="1.0" fill="var(--accent)" opacity="0.6" />
        <circle cx="2"  cy="6"  r="1.0" fill="var(--accent)" opacity="0.6" />
        <circle cx="6"  cy="6"  r="0.8" fill="var(--accent)" opacity="0.3" />
      </svg>
    </>
  );
}

function TechCorners() {
  // Circuit board right-angle paths in top-left corner
  return (
    <svg
      className="absolute top-2 left-2 pointer-events-none"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
    >
      {/* Horizontal trace */}
      <line x1="1" y1="3" x2="8" y2="3" stroke="var(--accent-secondary)" strokeWidth="1" opacity="0.6" />
      {/* Vertical trace down from end */}
      <line x1="8" y1="3" x2="8" y2="8" stroke="var(--accent-secondary)" strokeWidth="1" opacity="0.6" />
      {/* Second horizontal trace at top */}
      <line x1="1" y1="6" x2="5" y2="6" stroke="var(--accent-secondary)" strokeWidth="1" opacity="0.4" />
      {/* Via dots */}
      <circle cx="8" cy="8" r="1" fill="var(--accent-secondary)" opacity="0.8" />
      <circle cx="1" cy="3" r="0.8" fill="var(--accent-secondary)" opacity="0.6" />
      <circle cx="5" cy="6" r="0.8" fill="var(--accent-secondary)" opacity="0.5" />
    </svg>
  );
}

function NeonCorners() {
  // Pulsing glow dots in all four corners
  return (
    <>
      {/* Top-left */}
      <motion.div
        className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full pointer-events-none"
        style={{ backgroundColor: 'var(--accent)' }}
        animate={{ opacity: [0.4, 1, 0.4], boxShadow: ['0 0 2px var(--accent)', '0 0 6px var(--accent)', '0 0 2px var(--accent)'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />
      {/* Top-right */}
      <motion.div
        className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full pointer-events-none"
        style={{ backgroundColor: 'var(--accent)' }}
        animate={{ opacity: [0.4, 1, 0.4], boxShadow: ['0 0 2px var(--accent)', '0 0 6px var(--accent)', '0 0 2px var(--accent)'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        aria-hidden="true"
      />
      {/* Bottom-left */}
      <motion.div
        className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full pointer-events-none"
        style={{ backgroundColor: 'var(--accent)' }}
        animate={{ opacity: [0.4, 1, 0.4], boxShadow: ['0 0 2px var(--accent)', '0 0 6px var(--accent)', '0 0 2px var(--accent)'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        aria-hidden="true"
      />
      {/* Bottom-right */}
      <motion.div
        className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full pointer-events-none"
        style={{ backgroundColor: 'var(--accent)' }}
        animate={{ opacity: [0.4, 1, 0.4], boxShadow: ['0 0 2px var(--accent)', '0 0 6px var(--accent)', '0 0 2px var(--accent)'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        aria-hidden="true"
      />
    </>
  );
}

function CornerDecorations({ cardStyle }: { cardStyle: string }) {
  switch (cardStyle) {
    case 'holographic': return <HolographicCorners />;
    case 'ornate':      return <OrnateCorners />;
    case 'comic':       return <ComicCorners />;
    case 'tech':        return <TechCorners />;
    case 'neon':        return <NeonCorners />;
    default:            return null; // stark: nothing
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WidgetWrapper({
  title,
  children,
  className = '',
  collapsible = false,
  cardStyleOverride,
  sortableId,
}: WidgetWrapperProps) {
  const [collapsed, setCollapsed] = useState(false);
  const themeId = useDashboardStore((state) => state.themeId);
  const theme = getTheme(themeId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId || title });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 40 : undefined,
  };

  const cardStyleKey = cardStyleOverride ?? theme.cardStyle;
  const cardClass = CARD_STYLE_CLASS[cardStyleKey] ?? 'glass-card';

  // comic cards get a very subtle tilt for personality
  const comicRotate = cardStyleKey === 'comic' ? -0.5 : 0;

  return (
    <>
      {/* Inject @property CSS once — idempotent via a fixed id */}
      <style
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: SHIMMER_STYLE }}
        data-widget-shimmer="true"
      />

      {/* Outer group wrapper — enables group-hover for shimmer border */}
      <motion.div
        ref={setNodeRef}
        style={sortableStyle}
        className="relative group"
        data-widget-title={title}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: comicRotate }}
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        layout
      >
        {/* Animated conic-gradient shimmer border — visible only on hover */}
        <div
          className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 widget-shimmer-active pointer-events-none"
          style={{
            background: `conic-gradient(from var(--border-angle, 0deg), transparent 60%, var(--accent) 80%, transparent 100%)`,
            borderRadius: 'inherit',
          }}
          aria-hidden="true"
        />

        {/* Actual card — sits on top of the gradient layer */}
        <div
          className={`relative ${cardClass} theme-transition flex flex-col overflow-hidden ${className}`}
        >
          {/* Themed corner decorations */}
          <CornerDecorations cardStyle={cardStyleKey} />

          {/* Title bar */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b theme-transition select-none"
            style={{ borderColor: 'var(--card-border)' }}
          >
            {/* Drag handle */}
            <button
              className="mr-2 cursor-grab active:cursor-grabbing opacity-30 hover:opacity-60 transition-opacity touch-none"
              aria-label={`Drag to reorder ${title}`}
              {...attributes}
              {...listeners}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-secondary)' }}>
                <circle cx="8" cy="4" r="2" /><circle cx="16" cy="4" r="2" />
                <circle cx="8" cy="12" r="2" /><circle cx="16" cy="12" r="2" />
                <circle cx="8" cy="20" r="2" /><circle cx="16" cy="20" r="2" />
              </svg>
            </button>
            <motion.h3
              className="text-sm font-semibold tracking-wide uppercase"
              style={{ color: 'var(--accent)' }}
              animate={{
                textShadow: [
                  '0 0 4px var(--accent)',
                  '0 0 8px var(--accent)',
                  '0 0 4px var(--accent)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {title}
            </motion.h3>

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
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="block"
                  aria-hidden="true"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
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
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex-1 overflow-hidden"
              >
                <div className="p-4" style={{ color: 'var(--text)' }}>
                  {children}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
