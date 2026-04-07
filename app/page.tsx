'use client';

import { motion, AnimatePresence } from 'framer-motion';
import DashboardGrid from '@/components/layout/DashboardGrid';
import WidgetWrapper from '@/components/layout/WidgetWrapper';
import ThemeSelector from '@/components/layout/ThemeSelector';
import CommandPalette from '@/components/layout/CommandPalette';
import NotionSync from '@/components/layout/NotionSync';
import Clock from '@/components/widgets/Clock';
import TodoList from '@/components/widgets/TodoList';
import PomodoroTimer from '@/components/widgets/PomodoroTimer';
import Calendar from '@/components/widgets/Calendar';
import HabitTracker from '@/components/widgets/HabitTracker';
import QuickNotes from '@/components/widgets/QuickNotes';
import Weather from '@/components/widgets/Weather';
import GitHubActivity from '@/components/widgets/GitHubActivity';
import GradeTracker from '@/components/widgets/GradeTracker';
import Bookmarks from '@/components/widgets/Bookmarks';
import Greeting from '@/components/widgets/Greeting';
import Timetable from '@/components/widgets/Timetable';
import WorkoutTracker from '@/components/widgets/WorkoutTracker';
import PrayerTimes from '@/components/widgets/PrayerTimes';
import NutritionTracker from '@/components/widgets/NutritionTracker';
import ProjectProgress from '@/components/widgets/ProjectProgress';
import useDashboardStore from '@/lib/store';
import { useLayoutStore } from '@/lib/widget-store';
import useKeyboardShortcuts from '@/lib/useKeyboardShortcuts';

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

// ---------------------------------------------------------------------------
// Keyboard shortcuts help modal
// ---------------------------------------------------------------------------

const SHORTCUTS = [
  { key: 'Space', desc: 'Start / Pause Pomodoro' },
  { key: 'T', desc: 'Focus todo input' },
  { key: 'N', desc: 'Focus quick notes' },
  { key: 'F', desc: 'Toggle focus mode' },
  { key: 'Ctrl+K', desc: 'Command palette' },
  { key: '?', desc: 'Show / hide shortcuts' },
];

function ShortcutsModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative glass-card p-6 rounded-xl max-w-sm w-full"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--card-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--accent)' }}>
          Keyboard Shortcuts
        </h3>
        <div className="space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-xs">
              <span style={{ color: 'var(--text-secondary)' }}>{s.desc}</span>
              <kbd
                className="px-2 py-0.5 rounded font-mono text-xs border"
                style={{
                  borderColor: 'var(--card-border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-1.5 rounded text-xs border transition-opacity hover:opacity-80"
          style={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
        >
          Close (Esc)
        </button>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Focus mode widget config
// ---------------------------------------------------------------------------

const FOCUS_WIDGETS = new Set(['Clock', 'Timetable', 'Todo List', 'Pomodoro Timer', 'Quick Notes']);

interface WidgetConfig {
  title: string;
  className: string;
  collapsible: boolean;
  component: React.ComponentType;
}

const ALL_WIDGETS: WidgetConfig[] = [
  { title: 'Clock', className: 'col-span-1 sm:col-span-2', collapsible: false, component: Clock },
  { title: 'Timetable', className: 'col-span-1 md:col-span-2', collapsible: true, component: Timetable },
  { title: 'Todo List', className: 'col-span-1', collapsible: true, component: TodoList },
  { title: 'Pomodoro Timer', className: 'col-span-1', collapsible: true, component: PomodoroTimer },
  { title: 'Workout Tracker', className: 'col-span-1 md:col-span-2', collapsible: true, component: WorkoutTracker },
  { title: 'Prayer Times', className: 'col-span-1', collapsible: true, component: PrayerTimes },
  { title: 'Nutrition Tracker', className: 'col-span-1', collapsible: true, component: NutritionTracker },
  { title: 'Calendar', className: 'col-span-1 md:col-span-2', collapsible: true, component: Calendar },
  { title: 'Habit Tracker', className: 'col-span-1 md:col-span-2', collapsible: true, component: HabitTracker },
  { title: 'Project Progress', className: 'col-span-1', collapsible: true, component: ProjectProgress },
  { title: 'Grade Tracker', className: 'col-span-1 md:col-span-2', collapsible: true, component: GradeTracker },
  { title: 'Weather', className: 'col-span-1', collapsible: false, component: Weather },
  { title: 'GitHub Activity', className: 'col-span-1 sm:col-span-2', collapsible: true, component: GitHubActivity },
  { title: 'Bookmarks', className: 'col-span-1', collapsible: true, component: Bookmarks },
  { title: 'Quick Notes', className: 'col-span-1', collapsible: true, component: QuickNotes },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HomePage() {
  const focusMode = useDashboardStore((s) => s.focusMode);
  const toggleFocusMode = useDashboardStore((s) => s.toggleFocusMode);
  const widgetOrder = useLayoutStore((s) => s.widgetOrder);
  const resetLayout = useLayoutStore((s) => s.resetLayout);
  const { showHelp, setShowHelp, showCommandPalette, setShowCommandPalette } = useKeyboardShortcuts();

  // Sort widgets by saved order
  const sortedWidgets = [...ALL_WIDGETS].sort((a, b) => {
    const ai = widgetOrder.indexOf(a.title);
    const bi = widgetOrder.indexOf(b.title);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  const visibleWidgets = focusMode
    ? sortedWidgets.filter((w) => FOCUS_WIDGETS.has(w.title))
    : sortedWidgets;

  const widgetIds = visibleWidgets.map(w => w.title);

  return (
    <div
      className="min-h-screen theme-transition"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3 border-b theme-transition"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--card-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--accent)' }}
            aria-hidden="true"
          />
          <h1
            className="text-lg md:text-xl font-bold tracking-widest uppercase glow-accent"
            style={{ color: 'var(--accent)' }}
          >
            Command Center
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Command palette trigger */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded text-xs border transition-opacity hover:opacity-80"
            style={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
            aria-label="Open command palette"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <kbd className="font-mono text-[10px]">Ctrl+K</kbd>
          </button>
          {/* Focus mode toggle */}
          <button
            onClick={toggleFocusMode}
            className="p-2 rounded transition-opacity hover:opacity-80"
            style={{ color: focusMode ? 'var(--accent)' : 'var(--text-secondary)' }}
            aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
            title={focusMode ? 'Exit focus mode' : 'Focus mode'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {focusMode ? (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          </button>
          {/* Reset layout */}
          <button
            onClick={resetLayout}
            className="p-2 rounded transition-opacity hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Reset widget layout"
            title="Reset layout"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
          {/* Keyboard shortcuts hint */}
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 rounded text-xs font-mono transition-opacity hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Show keyboard shortcuts"
            title="Keyboard shortcuts"
          >
            ?
          </button>
          <NotionSync />
          <ThemeSelector />
        </div>
      </header>

      <Greeting />

      <DashboardGrid widgetIds={widgetIds}>
        <AnimatePresence mode="popLayout">
          <motion.div
            className="contents"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            key={focusMode ? 'focus' : 'full'}
          >
            {visibleWidgets.map((w) => (
              <motion.div
                key={w.title}
                variants={staggerItem}
                layout
                className={w.className}
              >
                <WidgetWrapper title={w.title} collapsible={w.collapsible} sortableId={w.title}>
                  <w.component />
                </WidgetWrapper>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </DashboardGrid>

      {/* Command palette */}
      <CommandPalette open={showCommandPalette} onClose={() => setShowCommandPalette(false)} />

      {/* Keyboard shortcuts modal */}
      <AnimatePresence>
        {showHelp && <ShortcutsModal onClose={() => setShowHelp(false)} />}
      </AnimatePresence>
    </div>
  );
}
