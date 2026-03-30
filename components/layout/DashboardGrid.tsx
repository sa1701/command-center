'use client';

import { type ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardGridProps {
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * DashboardGrid
 *
 * Responsive CSS Grid container. On small screens it uses 1 column, stepping
 * up to 2 → 3 → 4 at each breakpoint.  Widgets that should span multiple
 * columns must apply `col-span-*` classes on their own wrappers (or on the
 * WidgetWrapper className prop).
 *
 * The grid purposely uses CSS classes only so that Tailwind can purge
 * correctly — no runtime style injection.
 */
export default function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <main
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
        gap-4
        p-4
        md:p-6
        w-full
        min-h-screen
        auto-rows-min
      "
      aria-label="Dashboard widget grid"
    >
      {children}
    </main>
  );
}
