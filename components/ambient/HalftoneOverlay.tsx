'use client';

import { useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HalftoneOverlayProps {
  /** Dot fill color. Defaults to CSS variable --accent */
  color?: string;
  /** Diameter of each dot in pixels. Default: 3 */
  dotSize?: number;
  /** Gap between dot centers in pixels. Default: 14 */
  spacing?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HalftoneOverlay({
  color,
  dotSize = 3,
  spacing = 14,
}: HalftoneOverlayProps) {
  const resolvedColor = color ?? 'var(--accent)';
  const overlayRef = useRef<HTMLDivElement>(null);

  // Scroll-reactive dot sizing: dots slightly enlarge when user scrolls
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    let scrollY = 0;
    let ticking = false;

    const updateDots = () => {
      // Map scroll position to a scale factor: 1.0 → 1.4 over first 600 px
      const progress = Math.min(scrollY / 600, 1);
      const scale = 1 + progress * 0.4;
      overlay.style.backgroundSize = `${spacing * scale}px ${spacing * scale}px`;
      ticking = false;
    };

    const onScroll = () => {
      scrollY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(updateDots);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [spacing]);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        /*
         * CSS radial-gradient halftone dots.
         * Each "cell" is `spacing × spacing` px and contains one dot of radius `dotSize / 2`.
         * Opacity is intentionally very low (0.06) for an atmospheric, non-distracting overlay.
         */
        backgroundImage: `radial-gradient(circle, ${resolvedColor} ${dotSize / 2}px, transparent ${dotSize / 2}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
        opacity: 0.06,
        // Slight diagonal offset for classic Ben-Day halftone feel
        backgroundPosition: '0 0, 7px 7px',
      }}
    />
  );
}

/*
 * Usage example:
 *
 * import HalftoneOverlay from '@/components/ambient/HalftoneOverlay';
 *
 * // Default Spider-Verse halftone
 * <HalftoneOverlay />
 *
 * // Explicit cyan dots, smaller, tighter grid
 * <HalftoneOverlay color="#00e5ff" dotSize={2} spacing={10} />
 */
