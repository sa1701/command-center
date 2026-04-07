"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useDashboardStore from "@/lib/store";

// ---------------------------------------------------------------------------
// Theme family sets
// ---------------------------------------------------------------------------

const SPIDER_THEMES = new Set(["webb-verse", "spider-verse", "mcu-spider"]);
const STAR_WARS_THEMES = new Set(["ot-raimi", "prequel", "sequel"]);

// ---------------------------------------------------------------------------
// prefers-reduced-motion hook
// ---------------------------------------------------------------------------

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}

// ---------------------------------------------------------------------------
// Shared motion variants — used only when reduced motion is NOT requested
// ---------------------------------------------------------------------------

const floatVariants = {
  animate: {
    y: [0, -3, 0, 3, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
  },
};

const swayVariants = {
  animate: {
    rotate: [-3, 0, 3, 0, -3],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
  },
};

const glowVariants = {
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
  },
};

// ---------------------------------------------------------------------------
// Spider-Man decorations
// ---------------------------------------------------------------------------

/**
 * Small crouching Spider-Man silhouette — bottom-right corner.
 * Uses a simplified profile silhouette readable at 40-50 px.
 */
function SpiderManSilhouette({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      className="fixed bottom-4 right-4 pointer-events-none z-20"
      style={{ opacity: 0.2, width: 46, height: 46 }}
      variants={floatVariants}
      animate={reduced ? undefined : "animate"}
    >
      <svg
        viewBox="0 0 46 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="46"
        height="46"
      >
        {/*
          Crouching Spider-Man silhouette.
          Head, torso crouched forward, one arm extended, legs bent.
        */}
        {/* Head */}
        <ellipse cx="23" cy="7" rx="5" ry="5.5" fill="var(--accent)" />
        {/* Neck */}
        <rect x="21" y="11.5" width="4" height="3" rx="1" fill="var(--accent)" />
        {/* Torso — leaning forward */}
        <path
          d="M14 15 Q23 13 32 17 L30 26 Q23 28 16 24 Z"
          fill="var(--accent)"
        />
        {/* Left arm extended outward */}
        <path
          d="M14 16 Q8 14 3 11 Q2 10 4 10 Q8 12 14 15Z"
          fill="var(--accent)"
        />
        {/* Right arm bent behind */}
        <path
          d="M32 17 Q37 15 40 17 Q38 19 34 19Z"
          fill="var(--accent)"
        />
        {/* Left leg bent — weight bearing */}
        <path
          d="M17 24 Q14 30 12 36 Q10 40 14 40 Q17 40 17 36 Q19 30 20 26Z"
          fill="var(--accent)"
        />
        {/* Right leg extended back */}
        <path
          d="M28 25 Q31 31 33 37 Q34 40 30 41 Q28 41 28 37 Q27 31 25 26Z"
          fill="var(--accent)"
        />
        {/* Web-shooter wrist cuff on extended left hand */}
        <ellipse cx="4.5" cy="10.5" rx="2" ry="1.2" fill="var(--accent)" opacity="0.8" />
      </svg>
    </motion.div>
  );
}

/**
 * Tiny spider hanging from a thread — top area, right side.
 * Thread is a thin vertical line; spider body is a simple 8-legged oval.
 */
function HangingSpider({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      className="fixed pointer-events-none z-20"
      // originX/originY are framer-motion MotionValues accepted via style —
      // pivot the sway rotation from the top-center (where the thread begins).
      style={{
        opacity: 0.2,
        top: 80,
        right: "15%",
        width: 24,
        height: 60,
        originX: "50%",
        originY: "0%",
      }}
      variants={swayVariants}
      animate={reduced ? undefined : "animate"}
    >
      <svg
        viewBox="0 0 24 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="60"
      >
        {/* Silk thread */}
        <line
          x1="12"
          y1="0"
          x2="12"
          y2="36"
          stroke="var(--accent)"
          strokeWidth="0.8"
          opacity="0.6"
        />
        {/* Abdomen */}
        <ellipse cx="12" cy="44" rx="5" ry="6" fill="var(--accent)" />
        {/* Cephalothorax (head) */}
        <ellipse cx="12" cy="37" rx="3.5" ry="3" fill="var(--accent)" />
        {/* Eyes — two small dots */}
        <circle cx="10.5" cy="36.2" r="0.8" fill="var(--bg, #0d1117)" />
        <circle cx="13.5" cy="36.2" r="0.8" fill="var(--bg, #0d1117)" />
        {/* Legs — 4 per side, thin lines */}
        <line x1="8.5" y1="38" x2="2" y2="34" stroke="var(--accent)" strokeWidth="0.9" />
        <line x1="8.5" y1="40" x2="1" y2="39" stroke="var(--accent)" strokeWidth="0.9" />
        <line x1="8.5" y1="42" x2="2" y2="45" stroke="var(--accent)" strokeWidth="0.9" />
        <line x1="8.5" y1="44" x2="3" y2="50" stroke="var(--accent)" strokeWidth="0.9" />
        <line x1="15.5" y1="38" x2="22" y2="34" stroke="var(--accent)" strokeWidth="0.9" />
        <line x1="15.5" y1="40" x2="23" y2="39" stroke="var(--accent)" strokeWidth="0.9" />
        <line x1="15.5" y1="42" x2="22" y2="45" stroke="var(--accent)" strokeWidth="0.9" />
        <line x1="15.5" y1="44" x2="21" y2="50" stroke="var(--accent)" strokeWidth="0.9" />
      </svg>
    </motion.div>
  );
}

/**
 * Small quarter-circle web in two corners of the viewport.
 * top-left and bottom-right, static — just structural geometry.
 */
function WebCornerAccents() {
  return (
    <>
      {/* Top-left corner web */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-20"
        style={{ opacity: 0.1, width: 60, height: 60 }}
      >
        <svg
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
        >
          {/* Radial rays from top-left corner */}
          <line x1="0" y1="0" x2="60" y2="0"  stroke="var(--accent)" strokeWidth="0.7" />
          <line x1="0" y1="0" x2="50" y2="22" stroke="var(--accent)" strokeWidth="0.7" />
          <line x1="0" y1="0" x2="35" y2="40" stroke="var(--accent)" strokeWidth="0.7" />
          <line x1="0" y1="0" x2="18" y2="52" stroke="var(--accent)" strokeWidth="0.7" />
          <line x1="0" y1="0" x2="0"  y2="60" stroke="var(--accent)" strokeWidth="0.7" />
          {/* Concentric arc segments (quadratic bezier arcs) */}
          <path d="M 20 0 Q 14 14 0 20" stroke="var(--accent)" strokeWidth="0.6" fill="none" />
          <path d="M 36 0 Q 25 25 0 36" stroke="var(--accent)" strokeWidth="0.6" fill="none" />
          <path d="M 52 0 Q 36 36 0 52" stroke="var(--accent)" strokeWidth="0.6" fill="none" />
          {/* Intersection dots */}
          <circle cx="20" cy="0"  r="1.2" fill="var(--accent)" />
          <circle cx="36" cy="0"  r="1.2" fill="var(--accent)" />
          <circle cx="52" cy="0"  r="1.2" fill="var(--accent)" />
          <circle cx="0"  cy="20" r="1.2" fill="var(--accent)" />
          <circle cx="0"  cy="36" r="1.2" fill="var(--accent)" />
          <circle cx="0"  cy="52" r="1.2" fill="var(--accent)" />
          <circle cx="14" cy="14" r="1.2" fill="var(--accent)" />
          <circle cx="25" cy="25" r="1.2" fill="var(--accent)" />
        </svg>
      </div>

      {/* Bottom-right corner web */}
      <div
        aria-hidden="true"
        className="fixed bottom-0 right-0 pointer-events-none z-20"
        style={{ opacity: 0.1, width: 60, height: 60 }}
      >
        <svg
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          // Rotated 180deg — mirrors the top-left web
          style={{ transform: "rotate(180deg)" }}
        >
          <line x1="0" y1="0" x2="60" y2="0"  stroke="var(--accent)" strokeWidth="0.7" />
          <line x1="0" y1="0" x2="50" y2="22" stroke="var(--accent)" strokeWidth="0.7" />
          <line x1="0" y1="0" x2="35" y2="40" stroke="var(--accent)" strokeWidth="0.7" />
          <line x1="0" y1="0" x2="18" y2="52" stroke="var(--accent)" strokeWidth="0.7" />
          <line x1="0" y1="0" x2="0"  y2="60" stroke="var(--accent)" strokeWidth="0.7" />
          <path d="M 20 0 Q 14 14 0 20" stroke="var(--accent)" strokeWidth="0.6" fill="none" />
          <path d="M 36 0 Q 25 25 0 36" stroke="var(--accent)" strokeWidth="0.6" fill="none" />
          <path d="M 52 0 Q 36 36 0 52" stroke="var(--accent)" strokeWidth="0.6" fill="none" />
          <circle cx="20" cy="0"  r="1.2" fill="var(--accent)" />
          <circle cx="36" cy="0"  r="1.2" fill="var(--accent)" />
          <circle cx="52" cy="0"  r="1.2" fill="var(--accent)" />
          <circle cx="0"  cy="20" r="1.2" fill="var(--accent)" />
          <circle cx="0"  cy="36" r="1.2" fill="var(--accent)" />
          <circle cx="0"  cy="52" r="1.2" fill="var(--accent)" />
          <circle cx="14" cy="14" r="1.2" fill="var(--accent)" />
          <circle cx="25" cy="25" r="1.2" fill="var(--accent)" />
        </svg>
      </div>
    </>
  );
}

/**
 * Aggregates all Spider-Man themed decorations.
 */
function SpiderDecorations({ reduced }: { reduced: boolean }) {
  return (
    <>
      <SpiderManSilhouette reduced={reduced} />
      <HangingSpider reduced={reduced} />
      <WebCornerAccents />
    </>
  );
}

// ---------------------------------------------------------------------------
// Star Wars decorations
// ---------------------------------------------------------------------------

/** Blade color lookup per theme — falls back to a neutral white. */
const LIGHTSABER_COLORS: Record<string, string> = {
  "ot-raimi": "#4fc3f7",
  prequel:    "#c9a44a",
  sequel:     "#ff8f00",
};

/**
 * Lightsaber decoration — bottom-left corner.
 * Hilt + glowing blade oriented vertically (pointing up).
 */
function Lightsaber({ themeId, reduced }: { themeId: string; reduced: boolean }) {
  const bladeColor = LIGHTSABER_COLORS[themeId] ?? "#ffffff";

  // Glow: a soft box-shadow/filter on the blade element.
  // We animate the opacity of a wrapper that holds the glow so the
  // underlying SVG stays stable and ARIA-friendly.
  return (
    <div
      aria-hidden="true"
      className="fixed bottom-4 left-4 pointer-events-none z-20"
      style={{ opacity: 0.25, width: 18, height: 70 }}
    >
      <svg
        viewBox="0 0 18 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="70"
        overflow="visible"
      >
        {/* Hilt — lower 22px, two-tone grey rectangle */}
        <rect x="6" y="48" width="6" height="20" rx="1.5" fill="#888" />
        {/* Grip wrapping detail */}
        <rect x="5.5" y="52" width="7" height="1.5" rx="0.5" fill="#555" />
        <rect x="5.5" y="56" width="7" height="1.5" rx="0.5" fill="#555" />
        <rect x="5.5" y="60" width="7" height="1.5" rx="0.5" fill="#555" />
        {/* Emitter guard */}
        <rect x="4" y="46" width="10" height="3" rx="1" fill="#aaa" />
        {/* Blade — upper 44px */}
        <motion.rect
          x="7.5"
          y="2"
          width="3"
          height="44"
          rx="1.5"
          fill={bladeColor}
          variants={glowVariants}
          animate={reduced ? undefined : "animate"}
          style={{
            filter: `drop-shadow(0 0 4px ${bladeColor}) drop-shadow(0 0 8px ${bladeColor})`,
          }}
        />
        {/* Blade tip — rounded cap */}
        <ellipse cx="9" cy="2" rx="1.5" ry="2" fill={bladeColor}
          style={{ filter: `drop-shadow(0 0 6px ${bladeColor})` }}
        />
      </svg>
    </div>
  );
}

/**
 * R2-D2 silhouette — bottom-right corner.
 * Simple rounded-rectangle body + dome head with a blinking indicator.
 */
function R2D2({ reduced }: { reduced: boolean }) {
  const blinkVariants = {
    animate: {
      opacity: [1, 1, 0, 0, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        times: [0, 0.45, 0.5, 0.95, 1],
        ease: "linear" as const,
      },
    },
  };

  return (
    <div
      aria-hidden="true"
      className="fixed bottom-4 right-4 pointer-events-none z-20"
      style={{ opacity: 0.2, width: 35, height: 50 }}
    >
      <svg
        viewBox="0 0 35 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="35"
        height="50"
      >
        {/* Dome head */}
        <ellipse cx="17.5" cy="12" rx="13" ry="11.5" fill="var(--accent-secondary)" />
        {/* Neck connector */}
        <rect x="10" y="22" width="15" height="3" rx="1" fill="var(--accent-secondary)" opacity="0.7" />
        {/* Main body */}
        <rect x="6" y="25" width="23" height="20" rx="4" fill="var(--accent-secondary)" />
        {/* Body panel lines */}
        <line x1="6" y1="32" x2="29" y2="32" stroke="var(--bg, #0d1117)" strokeWidth="1" opacity="0.4" />
        <line x1="6" y1="38" x2="29" y2="38" stroke="var(--bg, #0d1117)" strokeWidth="1" opacity="0.4" />
        {/* Side legs */}
        <rect x="1"  y="35" width="5"  height="14" rx="2" fill="var(--accent-secondary)" opacity="0.8" />
        <rect x="29" y="35" width="5"  height="14" rx="2" fill="var(--accent-secondary)" opacity="0.8" />
        {/* Feet */}
        <rect x="0"  y="47" width="7"  height="3" rx="1.5" fill="var(--accent-secondary)" opacity="0.6" />
        <rect x="28" y="47" width="7"  height="3" rx="1.5" fill="var(--accent-secondary)" opacity="0.6" />
        {/* Central eye lens */}
        <circle cx="17.5" cy="11" r="4" fill="var(--bg, #0d1117)" opacity="0.5" />
        <circle cx="17.5" cy="11" r="2.5" fill="var(--accent-secondary)" opacity="0.9" />
        {/* Blinking dome indicator — top of dome */}
        <motion.circle
          cx="11"
          cy="7"
          r="1.8"
          fill="var(--accent)"
          variants={blinkVariants}
          animate={reduced ? undefined : "animate"}
        />
      </svg>
    </div>
  );
}

/**
 * Death Star tiny icon — near the top-right of the viewport.
 * Static circle with the iconic dish/indent.
 */
function DeathStar() {
  return (
    <div
      aria-hidden="true"
      className="fixed pointer-events-none z-20"
      style={{ opacity: 0.1, top: 12, right: 80, width: 20, height: 20 }}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
      >
        {/* Outer sphere */}
        <circle cx="10" cy="10" r="9" fill="var(--text-secondary)" />
        {/* Equatorial trench line */}
        <path
          d="M 1 10 Q 10 8 19 10"
          stroke="var(--bg, #0d1117)"
          strokeWidth="0.8"
          fill="none"
          opacity="0.6"
        />
        {/* Superlaser dish — top-left quadrant indent */}
        <circle cx="6.5" cy="7" r="3.2" fill="var(--bg, #0d1117)" opacity="0.55" />
        <circle cx="6.5" cy="7" r="1.8" fill="var(--text-secondary)" opacity="0.5" />
        <circle cx="6.5" cy="7" r="0.7" fill="var(--bg, #0d1117)" opacity="0.8" />
        {/* Surface detail lines */}
        <path d="M 5 2 Q 14 3 18 8"  stroke="var(--bg, #0d1117)" strokeWidth="0.5" fill="none" opacity="0.3" />
        <path d="M 11 18 Q 17 15 19 12" stroke="var(--bg, #0d1117)" strokeWidth="0.5" fill="none" opacity="0.3" />
      </svg>
    </div>
  );
}

/**
 * C-3PO silhouette — only on the 'prequel' theme, standing to the left of R2-D2.
 * Positioned bottom-right with a small horizontal offset to avoid overlapping R2.
 */
function C3PO() {
  return (
    <div
      aria-hidden="true"
      className="fixed pointer-events-none z-20"
      style={{ opacity: 0.15, bottom: 16, right: 52, width: 28, height: 55 }}
    >
      <svg
        viewBox="0 0 28 55"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="55"
      >
        {/* Head — rounded rectangle with distinct eye circles */}
        <ellipse cx="14" cy="8" rx="8" ry="7.5" fill="var(--accent)" />
        {/* Eyes */}
        <circle cx="10.5" cy="7"  r="2.5" fill="var(--bg, #1a1208)" />
        <circle cx="17.5" cy="7"  r="2.5" fill="var(--bg, #1a1208)" />
        <circle cx="10.5" cy="7"  r="1.2" fill="var(--accent)"      opacity="0.7" />
        <circle cx="17.5" cy="7"  r="1.2" fill="var(--accent)"      opacity="0.7" />
        {/* Neck */}
        <rect x="11" y="15" width="6" height="4" rx="1" fill="var(--accent)" />
        {/* Torso */}
        <path
          d="M 6 19 Q 14 17 22 19 L 21 34 Q 14 36 7 34 Z"
          fill="var(--accent)"
        />
        {/* Chest center detail — three circles */}
        <circle cx="14" cy="24" r="2"   fill="var(--bg, #1a1208)" opacity="0.5" />
        <circle cx="14" cy="24" r="0.9" fill="var(--accent)"      opacity="0.6" />
        {/* Left arm */}
        <path d="M 6 20 Q 2 25 1 32 Q 1 34 3 34 Q 4 34 5 30 Q 6 26 8 22Z" fill="var(--accent)" />
        {/* Right arm */}
        <path d="M 22 20 Q 26 25 27 32 Q 27 34 25 34 Q 24 34 23 30 Q 22 26 20 22Z" fill="var(--accent)" />
        {/* Pelvis */}
        <rect x="8" y="33" width="12" height="6" rx="2" fill="var(--accent)" opacity="0.9" />
        {/* Left leg */}
        <rect x="7"  y="38" width="6" height="14" rx="3" fill="var(--accent)" />
        {/* Right leg */}
        <rect x="15" y="38" width="6" height="14" rx="3" fill="var(--accent)" />
        {/* Feet */}
        <ellipse cx="10" cy="53" rx="4.5" ry="2" fill="var(--accent)" opacity="0.8" />
        <ellipse cx="18" cy="53" rx="4.5" ry="2" fill="var(--accent)" opacity="0.8" />
      </svg>
    </div>
  );
}

/**
 * Aggregates all Star Wars themed decorations.
 * C-3PO only renders when themeId === 'prequel'.
 */
function StarWarsDecorations({
  themeId,
  reduced,
}: {
  themeId: string;
  reduced: boolean;
}) {
  return (
    <>
      <Lightsaber themeId={themeId} reduced={reduced} />
      <R2D2 reduced={reduced} />
      <DeathStar />
      {themeId === "prequel" && <C3PO />}
    </>
  );
}

// ---------------------------------------------------------------------------
// ThemedDecorations — public entry point
// ---------------------------------------------------------------------------

/**
 * Renders subtle, theme-specific SVG easter egg decorations.
 *
 * - Spider-Man themes (webb-verse, spider-verse, mcu-spider): Spider-Man
 *   silhouette, hanging spider, and corner web accents.
 * - Star Wars themes (ot-raimi, prequel, sequel): lightsaber, R2-D2, Death
 *   Star, and (prequel-only) C-3PO silhouette.
 * - All other themes: renders nothing.
 *
 * All elements are pointer-events:none and aria-hidden so they never
 * interfere with dashboard interactions or assistive technology.
 * Animations respect prefers-reduced-motion.
 *
 * Usage:
 *   import ThemedDecorations from "@/components/ambient/ThemedDecorations";
 *   // Mount once at the root, alongside AmbientRenderer:
 *   <ThemedDecorations />
 */
export default function ThemedDecorations() {
  const themeId = useDashboardStore((s) => s.themeId);
  const reduced = usePrefersReducedMotion();

  if (SPIDER_THEMES.has(themeId)) {
    return <SpiderDecorations reduced={reduced} />;
  }

  if (STAR_WARS_THEMES.has(themeId)) {
    return <StarWarsDecorations themeId={themeId} reduced={reduced} />;
  }

  return null;
}
