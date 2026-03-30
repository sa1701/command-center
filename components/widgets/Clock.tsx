'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

// ---------------------------------------------------------------------------
// Clock Widget
// Displays current time (HH:MM:SS) and full date.
// Uses CSS variables so it adapts to any theme automatically.
// ---------------------------------------------------------------------------

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  // Initialise on client only to prevent SSR hydration mismatch
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeString = now ? format(now, 'HH:mm:ss') : '--:--:--';
  const dateString = now ? format(now, 'EEEE, d MMMM yyyy') : '';

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 select-none">
      <time
        dateTime={now?.toISOString()}
        className="font-mono text-5xl sm:text-6xl font-bold tracking-widest leading-none tabular-nums"
        style={{ color: 'var(--accent)' }}
        aria-label={`Current time: ${timeString}`}
      >
        {timeString}
      </time>

      <p
        className="mt-3 text-sm sm:text-base font-medium tracking-wide"
        style={{ color: 'var(--text-secondary)' }}
        aria-label={`Today is ${dateString}`}
      >
        {dateString}
      </p>
    </div>
  );
}
