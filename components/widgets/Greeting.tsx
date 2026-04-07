'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useTodoStore, usePomodoroStore, useHabitStore } from '@/lib/widget-store';
import useDashboardStore from '@/lib/store';

// ---------------------------------------------------------------------------
// Flavor text pools per theme group
// ---------------------------------------------------------------------------

const SPIDER_FLAVOR = [
  "Your spider-sense is tingling...",
  "With great power comes great productivity.",
  "Time to swing into action!",
];

const SW_FLAVOR = [
  "The Force is strong with you today.",
  "May the productivity be with you.",
  "This is the way.",
];

// Fallback for any other themes
const DEFAULT_FLAVOR = [
  "Let's make today count.",
  "Focus. Build. Ship.",
  "One task at a time.",
];

function getFlavorText(themeId: string): string {
  const pool = themeId.startsWith('sp-') || themeId.includes('spider') || themeId.includes('raimi') || themeId.includes('ot-')
    ? SPIDER_FLAVOR
    : themeId.startsWith('sw-') || themeId.includes('star') || themeId.includes('jedi') || themeId.includes('sith')
    ? SW_FLAVOR
    : DEFAULT_FLAVOR;

  return pool[Math.floor(Math.random() * pool.length)];
}

// ---------------------------------------------------------------------------
// Animated number counter
// ---------------------------------------------------------------------------

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    // Reset to 0 when value changes so the tick-up re-runs
    setDisplay(0);
    if (value === 0) return;

    const start = performance.now();
    const duration = 800;

    const animate = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      // Ease-out cubic for a natural deceleration
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{display}</span>;
}

// ---------------------------------------------------------------------------
// Greeting helpers
// ---------------------------------------------------------------------------

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: -14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

const flavorVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
};

const statVariants = {
  hidden: { opacity: 0, y: 6, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 20 },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Greeting() {
  const [mounted, setMounted] = useState(false);
  const [flavorText, setFlavorText] = useState('');

  const todos = useTodoStore((s) => s.todos);
  const sessions = usePomodoroStore((s) => s.sessions);
  const habits = useHabitStore((s) => s.habits);
  const themeId = useDashboardStore((s) => s.themeId);

  useEffect(() => {
    setMounted(true);
    setFlavorText(getFlavorText(themeId));
  // Only pick flavor text once on mount; themeId intentionally excluded so
  // it doesn't re-randomize on every theme change mid-session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const activeTasks = todos.filter((t) => !t.completed).length;

  const activeStreaks = habits.filter((h) => {
    const today = format(now, 'yyyy-MM-dd');
    return h.completedDates.includes(today);
  }).length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="px-4 md:px-6 py-4"
    >
      {/* Greeting heading */}
      <motion.h2
        variants={headingVariants}
        className="text-xl md:text-2xl font-bold tracking-wide"
        style={{ color: 'var(--text)' }}
      >
        {greeting},{' '}
        <span style={{ color: 'var(--accent)' }}>Seif</span>
      </motion.h2>

      {/* Themed flavor text subtitle */}
      {flavorText && (
        <motion.p
          variants={flavorVariants}
          className="text-xs mt-0.5 italic"
          style={{ color: 'var(--text-secondary)' }}
        >
          {flavorText}
        </motion.p>
      )}

      {/* Animated stats row */}
      <div className="flex flex-wrap gap-4 mt-2">
        <motion.span
          variants={statVariants}
          className="text-xs"
          style={{ color: 'var(--text-secondary)' }}
        >
          <AnimatedNumber value={activeTasks} />{' '}
          task{activeTasks !== 1 ? 's' : ''} remaining
        </motion.span>

        <motion.span
          variants={statVariants}
          className="text-xs"
          style={{ color: 'var(--text-secondary)' }}
        >
          <AnimatedNumber value={sessions} />{' '}
          focus session{sessions !== 1 ? 's' : ''} today
        </motion.span>

        {activeStreaks > 0 && (
          <motion.span
            variants={statVariants}
            className="text-xs"
            style={{ color: 'var(--accent)' }}
          >
            <AnimatedNumber value={activeStreaks} />{' '}
            habit{activeStreaks !== 1 ? 's' : ''} done today
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

/*
 * Usage example:
 *
 * import Greeting from '@/components/widgets/Greeting';
 *
 * // Drop-in replacement — reads themeId from useDashboardStore automatically
 * <Greeting />
 */
