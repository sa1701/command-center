'use client';

import { useState } from 'react';
import { useWorkoutStore } from '@/lib/widget-store';
import type { Exercise, LoggedSet, WorkoutLog } from '@/lib/widget-store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SetInput {
  weight: string;
  reps: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TODAY = new Date().toISOString().split('T')[0];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ISO day: Mon=1 … Sun=7
const SCHEDULE_MAP: Record<number, string> = {
  1: 'Upper A',
  2: 'Lower A',
  4: 'Upper B',
  5: 'Lower B',
};

function getTodayIsoDay(): number {
  const d = new Date().getDay(); // 0=Sun … 6=Sat
  return d === 0 ? 7 : d;
}

function isWorkoutDay(isoDay: number): boolean {
  return isoDay in SCHEDULE_MAP;
}

// Returns 1-based ISO weekday for Mon–Sun index (0=Mon … 6=Sun)
function isoWeekdayForIndex(index: number): number {
  return index + 1; // index 0 → Mon=1, index 6 → Sun=7
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function WorkoutIcon({ type }: { type: string | null }) {
  if (!type) {
    // Rest day
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Z" />
        <path d="M7 13s.5-2 5-2 5 2 5 2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    );
  }
  const isUpper = type.toLowerCase().includes('upper');
  if (isUpper) {
    // Dumbbell / upper body icon
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 4v16" />
        <path d="M18 4v16" />
        <path d="M6 8H2v8h4" />
        <path d="M18 8h4v8h-4" />
        <line x1="6" y1="12" x2="18" y2="12" />
      </svg>
    );
  }
  // Lower body icon (legs)
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 2v10l-2 8" />
      <path d="M16 2v10l2 8" />
      <line x1="8" y1="9" x2="16" y2="9" />
    </svg>
  );
}

function MiniSparkline({ weights }: { weights: number[] }) {
  if (weights.length === 0) return null;
  const max = Math.max(...weights);
  const min = Math.min(...weights);
  const range = max - min || 1;

  return (
    <div
      className="flex items-end gap-0.5"
      aria-label={`Weight trend: ${weights.join(', ')} kg`}
      role="img"
    >
      {weights.map((w, i) => {
        const heightPct = ((w - min) / range) * 100;
        const barH = Math.max(4, Math.round((heightPct / 100) * 20));
        return (
          <div
            key={i}
            style={{
              width: 5,
              height: barH,
              backgroundColor: 'var(--accent)',
              opacity: 0.5 + (i / weights.length) * 0.5,
              borderRadius: 1,
            }}
            title={`${w} kg`}
          />
        );
      })}
    </div>
  );
}

function LoggedSetPill({ set }: { set: LoggedSet }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: 'var(--accent)',
        color: '#fff',
        opacity: 0.85,
      }}
    >
      {set.weight}kg x {set.reps}
    </span>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
  loggedSets: LoggedSet[];
  history: number[];
  onLogSet: (exerciseName: string, weight: number, reps: number) => void;
}

function ExerciseCard({ exercise, loggedSets, history, onLogSet }: ExerciseCardProps) {
  const [input, setInput] = useState<SetInput>({ weight: '', reps: '' });
  const [error, setError] = useState<string | null>(null);

  function handleLog() {
    const w = parseFloat(input.weight);
    const r = parseInt(input.reps, 10);
    if (!input.weight || isNaN(w) || w <= 0) {
      setError('Enter a valid weight');
      return;
    }
    if (!input.reps || isNaN(r) || r <= 0) {
      setError('Enter valid reps');
      return;
    }
    setError(null);
    onLogSet(exercise.name, w, r);
    setInput({ weight: '', reps: '' });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLog();
  }

  return (
    <div
      className="rounded-lg p-2.5 flex flex-col gap-1.5"
      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }}
    >
      {/* Exercise header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium truncate"
            style={{ color: 'var(--text)' }}
          >
            {exercise.name}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {exercise.muscle} &middot; {exercise.setsTarget} x {exercise.repsTarget}
          </p>
        </div>
        {history.length > 1 && (
          <div className="flex-shrink-0 pt-0.5">
            <MiniSparkline weights={history} />
          </div>
        )}
      </div>

      {/* Logged set pills */}
      {loggedSets.length > 0 && (
        <div className="flex flex-wrap gap-1" aria-label="Logged sets">
          {loggedSets.map((s, i) => (
            <LoggedSetPill key={i} set={s} />
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min="0"
          step="0.5"
          className="input-themed w-16 text-xs"
          placeholder="kg"
          value={input.weight}
          onChange={(e) => setInput((prev) => ({ ...prev, weight: e.target.value }))}
          onKeyDown={handleKeyDown}
          aria-label={`Weight for ${exercise.name}`}
        />
        <input
          type="number"
          min="0"
          step="1"
          className="input-themed w-14 text-xs"
          placeholder="reps"
          value={input.reps}
          onChange={(e) => setInput((prev) => ({ ...prev, reps: e.target.value }))}
          onKeyDown={handleKeyDown}
          aria-label={`Reps for ${exercise.name}`}
        />
        <button
          onClick={handleLog}
          className="flex items-center justify-center rounded-md text-xs font-bold w-7 h-7 flex-shrink-0 transition-opacity hover:opacity-80 active:opacity-60"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          aria-label={`Log set for ${exercise.name}`}
        >
          +
        </button>
        {error && (
          <p className="text-xs" style={{ color: 'var(--danger)' }} role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

/**
 * WorkoutTracker widget
 *
 * Usage:
 *   import WorkoutTracker from '@/components/widgets/WorkoutTracker';
 *   // In your dashboard layout:
 *   <WorkoutTracker />
 */
export default function WorkoutTracker() {
  const { exercises, getTodayWorkout, logSet, getLog, getExerciseHistory } = useWorkoutStore();

  const todayWorkout = getTodayWorkout(); // e.g. "Upper A" | "Lower A" | null
  const todayLog: WorkoutLog | undefined = getLog(TODAY);
  const todayIsoDay = getTodayIsoDay();

  const exerciseList: Exercise[] = todayWorkout ? (exercises[todayWorkout] ?? []) : [];

  function handleLogSet(exerciseName: string, weight: number, reps: number) {
    logSet(TODAY, todayWorkout ?? 'Rest', exerciseName, { weight, reps });
  }

  function getLoggedSetsForExercise(exerciseName: string): LoggedSet[] {
    return todayLog?.exercises?.[exerciseName] ?? [];
  }

  function getHistoryWeights(exerciseName: string): number[] {
    const history = getExerciseHistory(exerciseName, 4);
    return history.map((h) => Math.max(...h.sets.map((s) => s.weight), 0));
  }

  return (
    <section
      className="flex flex-col gap-3 rounded-xl p-3 h-full overflow-auto"
      style={{ border: '1px solid var(--card-border)' }}
      aria-label="Workout Tracker"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center rounded-lg w-8 h-8 flex-shrink-0"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          aria-hidden="true"
        >
          <WorkoutIcon type={todayWorkout} />
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Today&rsquo;s Workout
          </p>
          <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text)' }}>
            {todayWorkout ?? 'Rest Day'}
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Weekly schedule bar                                                  */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="flex items-center justify-between rounded-lg px-2 py-1.5"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }}
        aria-label="Weekly schedule"
        role="list"
      >
        {DAY_LABELS.map((label, index) => {
          const isoDay = isoWeekdayForIndex(index);
          const isToday = isoDay === todayIsoDay;
          const hasWorkout = isWorkoutDay(isoDay);
          const workoutLabel = SCHEDULE_MAP[isoDay];

          return (
            <div
              key={label}
              className="flex flex-col items-center gap-1"
              role="listitem"
              aria-label={`${label}: ${workoutLabel ?? 'Rest'}`}
            >
              <span
                className="text-xs font-medium"
                style={{
                  color: isToday ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: isToday ? 700 : 400,
                }}
              >
                {label}
              </span>
              <div
                className="rounded-full"
                style={{
                  width: 7,
                  height: 7,
                  backgroundColor: hasWorkout
                    ? isToday
                      ? 'var(--accent)'
                      : 'var(--text-secondary)'
                    : 'transparent',
                  border: hasWorkout
                    ? 'none'
                    : '1.5px solid var(--card-border)',
                  opacity: hasWorkout && !isToday ? 0.45 : 1,
                }}
                aria-hidden="true"
              />
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Exercise list or rest day state                                      */}
      {/* ------------------------------------------------------------------ */}
      {todayWorkout ? (
        <div className="flex flex-col gap-2" role="list" aria-label="Exercises">
          {exerciseList.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: 'var(--text-secondary)' }}>
              No exercises found for {todayWorkout}.
            </p>
          ) : (
            exerciseList.map((exercise) => (
              <div key={exercise.name} role="listitem">
                <ExerciseCard
                  exercise={exercise}
                  loggedSets={getLoggedSetsForExercise(exercise.name)}
                  history={getHistoryWeights(exercise.name)}
                  onLogSet={handleLogSet}
                />
              </div>
            ))
          )}
        </div>
      ) : (
        /* Rest day state */
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-lg py-6 px-3 text-center"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }}
          role="status"
          aria-label="Rest day"
        >
          <div style={{ color: 'var(--text-secondary)' }} aria-hidden="true">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            Recovery Day
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Muscles grow at rest. Take it easy today.
          </p>
        </div>
      )}
    </section>
  );
}
