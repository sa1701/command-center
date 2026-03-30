'use client';

import { useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScanLinesProps {
  /**
   * 0–1 scale that multiplies base opacity values.
   * 0 = invisible, 1 = full effect. Default: 1
   */
  intensity?: number;
  /**
   * Whether the scan line band slowly scrolls vertically (CRT refresh effect).
   * Default: true
   */
  animated?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ScanLines({ intensity = 1, animated = true }: ScanLinesProps) {
  const bandRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // Clamped intensities for each layer
  const linesOpacity = Math.max(0, Math.min(1, intensity)) * 0.04;
  const vignetteOpacity = Math.max(0, Math.min(1, intensity)) * 0.55;

  useEffect(() => {
    if (!animated || !bandRef.current) return;

    let start: number | null = null;
    // The scrolling band takes ~4 s to travel the full viewport height
    const DURATION = 4000;

    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = (ts - start) % DURATION;
      const progress = elapsed / DURATION; // 0 → 1
      // Shift from -20% (above viewport) to 120% (below viewport)
      const yPercent = -20 + progress * 140;

      if (bandRef.current) {
        bandRef.current.style.transform = `translateY(${yPercent}vh)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animated]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      {/* ── Horizontal scan lines ─────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,1) 3px, rgba(0,0,0,1) 4px)',
          opacity: linesOpacity,
        }}
      />

      {/* ── Scrolling CRT refresh band ────────────────────────────────── */}
      {animated && (
        <div
          ref={bandRef}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '20vh',
            background:
              'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.018) 40%, rgba(255,255,255,0.018) 60%, transparent 100%)',
            willChange: 'transform',
          }}
        />
      )}

      {/* ── Vignette ──────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.8) 100%)',
          opacity: vignetteOpacity,
        }}
      />
    </div>
  );
}

/*
 * Usage example:
 *
 * import ScanLines from '@/components/ambient/ScanLines';
 *
 * // Default — subtle animated CRT effect
 * <ScanLines />
 *
 * // Static, slightly more visible
 * <ScanLines animated={false} intensity={0.8} />
 */
