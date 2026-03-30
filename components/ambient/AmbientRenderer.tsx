'use client';

import useDashboardStore from '@/lib/store';
import Starfield from './Starfield';
import WebPattern from './WebPattern';
import ScanLines from './ScanLines';
import HalftoneOverlay from './HalftoneOverlay';

// ---------------------------------------------------------------------------
// Theme → ambient effect mapping
// ---------------------------------------------------------------------------

/**
 * Returns the ambient layer(s) for a given themeId.
 * Each theme gets a unique atmospheric combination derived from themes.ts.
 */
function AmbientLayers({ themeId }: { themeId: string }) {
  switch (themeId) {
    // OT x Raimi: full starfield + CRT scan-line overlay
    case 'ot-raimi':
      return (
        <>
          <Starfield speed={1} density={1} />
          <ScanLines intensity={1} animated={true} />
        </>
      );

    // Prequel: slower, warmer star drift — no CRT noise
    case 'prequel':
      return <Starfield speed={0.4} density={0.55} />;

    // Sequel: minimal, cold — sparse stars, no distractions
    case 'sequel':
      return <Starfield speed={0.25} density={0.3} />;

    // Webb-Verse: web pattern only — neon electric feel
    case 'webb-verse':
      return <WebPattern />;

    // Spider-Verse: halftone Ben-Day dots + web overlay
    case 'spider-verse':
      return (
        <>
          <HalftoneOverlay />
          <WebPattern opacity={0.85} />
        </>
      );

    // MCU Spider: subtle tech web — low opacity, clean
    case 'mcu-spider':
      return <WebPattern opacity={0.6} />;

    // Unknown / future themes: no ambient layer
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// AmbientRenderer
// ---------------------------------------------------------------------------

/**
 * Reads the current themeId from the Zustand store and renders the matching
 * ambient background effect(s). Mount this once at the root, behind all content.
 *
 * The wrapper is fixed, covers the full viewport, and is non-interactive so it
 * never interferes with content above it.
 */
export default function AmbientRenderer() {
  const themeId = useDashboardStore((state) => state.themeId);

  return (
    // z-index: 0 keeps ambient layers behind the dashboard content (z-index: 10+)
    // overflow: hidden prevents any canvas / SVG overflow from causing scrollbars
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <AmbientLayers themeId={themeId} />
    </div>
  );
}

/*
 * Usage example:
 *
 * // In your root layout or page, place AmbientRenderer before dashboard content:
 *
 * import AmbientRenderer from '@/components/ambient/AmbientRenderer';
 *
 * export default function DashboardLayout({ children }) {
 *   return (
 *     <div style={{ position: 'relative', minHeight: '100vh' }}>
 *       <AmbientRenderer />
 *       <main style={{ position: 'relative', zIndex: 10 }}>
 *         {children}
 *       </main>
 *     </div>
 *   );
 * }
 */
