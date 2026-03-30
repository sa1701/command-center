'use client';

import { useEffect, useRef, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WebPatternProps {
  /** Line / node color. Defaults to CSS variable --accent */
  color?: string;
  /** Overall opacity multiplier for the entire overlay. Default: 1 (uses built-in low opacities) */
  opacity?: number;
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

interface WebCorner {
  cx: number;
  cy: number;
  rings: number;
  rayCount: number;
  maxRadius: number;
}

// Fixed corners (percentages of viewBox 1000×1000)
const CORNERS: WebCorner[] = [
  { cx: 0,    cy: 0,    rings: 6, rayCount: 5, maxRadius: 420 },
  { cx: 1000, cy: 0,    rings: 6, rayCount: 5, maxRadius: 420 },
  { cx: 0,    cy: 1000, rings: 5, rayCount: 4, maxRadius: 380 },
  { cx: 1000, cy: 1000, rings: 5, rayCount: 4, maxRadius: 380 },
];

// Angle sweep for each corner (which quadrant the web covers)
const CORNER_SWEEPS: [number, number][] = [
  [0,        Math.PI / 2],         // top-left  → right and down
  [Math.PI / 2, Math.PI],          // top-right → left and down
  [-Math.PI / 2, 0],               // bottom-left → right and up
  [Math.PI,  (3 * Math.PI) / 2],   // bottom-right → left and up
];

// Build SVG path data for a single web corner
function buildWebPaths(corner: WebCorner, sweep: [number, number]): {
  lines: string[];
  nodes: { x: number; y: number }[];
} {
  const { cx, cy, rings, rayCount, maxRadius } = corner;
  const [startAngle, endAngle] = sweep;
  const lines: string[] = [];
  const nodes: { x: number; y: number }[] = [];

  const angles: number[] = [];
  for (let r = 0; r < rayCount; r++) {
    angles.push(startAngle + (r / (rayCount - 1)) * (endAngle - startAngle));
  }

  // Radial rays
  for (const angle of angles) {
    const ex = cx + Math.cos(angle) * maxRadius;
    const ey = cy + Math.sin(angle) * maxRadius;
    lines.push(`M ${cx} ${cy} L ${ex} ${ey}`);
  }

  // Concentric ring segments connecting adjacent rays
  for (let ring = 1; ring <= rings; ring++) {
    const r = (ring / rings) * maxRadius;
    for (let a = 0; a < angles.length - 1; a++) {
      const x1 = cx + Math.cos(angles[a]) * r;
      const y1 = cy + Math.sin(angles[a]) * r;
      const x2 = cx + Math.cos(angles[a + 1]) * r;
      const y2 = cy + Math.sin(angles[a + 1]) * r;

      // Slight curve toward center for that web elasticity feel
      const mx = cx + Math.cos((angles[a] + angles[a + 1]) / 2) * r * 0.92;
      const my = cy + Math.sin((angles[a] + angles[a + 1]) / 2) * r * 0.92;
      lines.push(`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`);

      // Node at intersection
      nodes.push({ x: x1, y: y1 });
    }
    // Last ray node too
    const lastAngle = angles[angles.length - 1];
    nodes.push({ x: cx + Math.cos(lastAngle) * r, y: cy + Math.sin(lastAngle) * r });
  }

  return { lines, nodes };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WebPattern({ color, opacity = 1 }: WebPatternProps) {
  const resolvedColor = color ?? 'var(--accent)';

  // Memoize geometry — never changes
  const geometry = useMemo(() => {
    return CORNERS.map((corner, i) => buildWebPaths(corner, CORNER_SWEEPS[i]));
  }, []);

  // Pulse animation via direct DOM manipulation (avoids re-renders on every frame)
  const nodesGroupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    let raf: number;
    let start: number | null = null;

    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const pulse = 0.6 + 0.4 * Math.sin(elapsed * 0.0015 * Math.PI * 2);

      if (nodesGroupRef.current) {
        nodesGroupRef.current.style.opacity = String(pulse * opacity * 0.55);
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [opacity]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity,
      }}
    >
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Web lines — static, very low opacity */}
        <g stroke={resolvedColor} strokeWidth="0.6" fill="none" opacity={0.06}>
          {geometry.flatMap((g, gi) =>
            g.lines.map((d, li) => <path key={`line-${gi}-${li}`} d={d} />)
          )}
        </g>

        {/* Web nodes — animated pulse */}
        <g ref={nodesGroupRef} fill={resolvedColor}>
          {geometry.flatMap((g, gi) =>
            g.nodes.map((n, ni) => (
              <circle key={`node-${gi}-${ni}`} cx={n.x} cy={n.y} r={2.5} />
            ))
          )}
        </g>
      </svg>
    </div>
  );
}

/*
 * Usage example:
 *
 * import WebPattern from '@/components/ambient/WebPattern';
 *
 * // Uses --accent CSS variable, default opacity envelope
 * <WebPattern />
 *
 * // Explicit color + dimmer
 * <WebPattern color="#fdd835" opacity={0.7} />
 */
