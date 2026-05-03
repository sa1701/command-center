'use client';

import { useState } from 'react';
import { useWorkoutStore } from '@/lib/widget-store';
import type { Exercise, LoggedSet, WorkoutDay } from '@/lib/widget-store';

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

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getTodayIsoDay(): number {
  const d = new Date().getDay(); // 0=Sun … 6=Sat
  return d === 0 ? 7 : d;       // convert to ISO: 1=Mon … 7=Sun
}

function isoToJs(isoDay: number): number {
  return isoDay === 7 ? 0 : isoDay;
}

function dateForIsoDay(isoDay: number): string {
  const today = new Date();
  const offset = isoDay - getTodayIsoDay();
  const d = new Date(today);
  d.setDate(today.getDate() + offset);
  return d.toISOString().split('T')[0];
}

function workoutShortLabel(w: WorkoutDay): string {
  switch (w) {
    case 'Upper A': return 'Up-A';
    case 'Lower A': return 'Lo-A';
    case 'Upper B': return 'Up-B';
    case 'Lower B': return 'Lo-B';
    case 'Run':     return 'Run';
    case 'Rest':    return 'Rest';
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function WorkoutIcon({ type }: { type: WorkoutDay }) {
  if (type === 'Rest') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Z" />
        <path d="M7 13s.5-2 5-2 5 2 5 2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    );
  }
  if (type === 'Run') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="4" r="1.5" />
        <path d="M8 20l2-6 2 3 3-7 1 4h2" />
        <path d="M6 12l2-3 2 1 2-3" />
      </svg>
    );
  }
  if (type.startsWith('Upper')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 4v16" />
        <path d="M18 4v16" />
        <path d="M6 8H2v8h4" />
        <path d="M18 8h4v8h-4" />
        <line x1="6" y1="12" x2="18" y2="12" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    <div className="flex items-end gap-0.5" aria-label={`Weight trend: ${weights.join(', ')} kg`} role="img">
      {weights.map((w, i) => {
        const barH = Math.max(4, Math.round(((w - min) / range) * 20));
        return (
          <div
            key={i}
            style={{ width: 5, height: barH, backgroundColor: 'var(--accent)', opacity: 0.5 + (i / weights.length) * 0.5, borderRadius: 1 }}
            title={`${w} kg`}
          />
        );
      })}
    </div>
  );
}

function LoggedSetPill({ set }: { set: LoggedSet }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: 'var(--accent)', color: '#fff', opacity: 0.85 }}>
      {set.weight}kg × {set.reps}
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
    if (!input.weight || isNaN(w) || w <= 0) { setError('Enter a valid weight'); return; }
    if (!input.reps || isNaN(r) || r <= 0) { setError('Enter valid reps'); return; }
    setError(null);
    onLogSet(exercise.name, w, r);
    setInput({ weight: '', reps: '' });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLog();
  }

  return (
    <div className="rounded-lg p-2.5 flex flex-col gap-1.5" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{exercise.name}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {exercise.muscle} · <span style={{ color: 'var(--accent)', opacity: 0.9 }}>Top: {exercise.set1Reps}</span> · Back-off: {exercise.set2Reps}
          </p>
        </div>
        {history.length > 1 && (
          <div className="flex-shrink-0 pt-0.5"><MiniSparkline weights={history} /></div>
        )}
      </div>
      {loggedSets.length > 0 && (
        <div className="flex flex-wrap gap-1" aria-label="Logged sets">
          {loggedSets.map((s, i) => <LoggedSetPill key={i} set={s} />)}
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <input
          type="number" min="0" step="0.5"
          className="input-themed w-16 text-xs"
          placeholder="kg"
          value={input.weight}
          onChange={(e) => setInput(p => ({ ...p, weight: e.target.value }))}
          onKeyDown={handleKeyDown}
          aria-label={`Weight for ${exercise.name}`}
        />
        <input
          type="number" min="0" step="1"
          className="input-themed w-14 text-xs"
          placeholder="reps"
          value={input.reps}
          onChange={(e) => setInput(p => ({ ...p, reps: e.target.value }))}
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
        {error && <p className="text-xs" style={{ color: 'var(--danger)' }} role="alert">{error}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function WorkoutTracker() {
  const {
    exercises, dayStatus, dayOverride,
    getWorkoutFor, logSet, getLog, getExerciseHistory,
    setDayStatus, swapDay, clearOverride,
  } = useWorkoutStore();

  const todayIsoDay = getTodayIsoDay();
  const [selectedIsoDay, setSelectedIsoDay] = useState(todayIsoDay);
  const [showSwapPicker, setShowSwapPicker] = useState(false);

  const selectedDate = dateForIsoDay(selectedIsoDay);
  const effectiveWorkout = getWorkoutFor(selectedDate, isoToJs(selectedIsoDay));
  const statusForDay = dayStatus[selectedDate];
  const hasOverride = !!dayOverride[selectedDate];

  const todayDate = dateForIsoDay(todayIsoDay);
  const todayWorkout = getWorkoutFor(todayDate, isoToJs(todayIsoDay));
  const todayStatus = dayStatus[todayDate];

  const selectedLog = getLog(selectedDate);
  const isLiftDay = effectiveWorkout !== 'Run' && effectiveWorkout !== 'Rest';
  const exerciseList: Exercise[] = isLiftDay ? (exercises[effectiveWorkout] ?? []) : [];

  function handleLogSet(exerciseName: string, weight: number, reps: number) {
    logSet(selectedDate, effectiveWorkout, exerciseName, { weight, reps });
  }

  function getLoggedSets(exerciseName: string): LoggedSet[] {
    return selectedLog?.exercises?.[exerciseName] ?? [];
  }

  function getHistoryWeights(exerciseName: string): number[] {
    return getExerciseHistory(exerciseName, 4).map(h => Math.max(...h.sets.map(s => s.weight), 0));
  }

  return (
    <section
      className="flex flex-col gap-3 rounded-xl p-3 h-full overflow-auto"
      style={{ border: '1px solid var(--card-border)' }}
      aria-label="Workout Tracker"
    >
      {/* Header — always shows today */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center rounded-lg w-8 h-8 flex-shrink-0"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          aria-hidden="true"
        >
          <WorkoutIcon type={todayWorkout} />
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Today&rsquo;s Workout</p>
          <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text)' }}>
            {todayWorkout}
            {todayStatus && (
              <span className="ml-2 text-xs font-normal" style={{ color: todayStatus === 'done' ? 'var(--accent)' : 'var(--danger)' }}>
                {todayStatus === 'done' ? '✓ Done' : '− Skipped'}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Clickable day strip */}
      <div className="flex items-stretch gap-1" role="tablist" aria-label="Week schedule">
        {DAY_LABELS.map((label, index) => {
          const isoDay = index + 1;
          const date = dateForIsoDay(isoDay);
          const workout = getWorkoutFor(date, isoToJs(isoDay));
          const status = dayStatus[date];
          const isToday = isoDay === todayIsoDay;
          const isSelected = isoDay === selectedIsoDay;

          return (
            <button
              key={label}
              role="tab"
              aria-selected={isSelected}
              aria-label={`${label}, ${workout}${status ? ', ' + status : ''}`}
              onClick={() => { setSelectedIsoDay(isoDay); setShowSwapPicker(false); }}
              className="flex-1 flex flex-col items-center gap-0.5 rounded-md py-1.5 px-0.5 transition-colors"
              style={{
                backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg-secondary)',
                border: isToday && !isSelected ? '1.5px solid var(--accent)' : '1px solid var(--card-border)',
                color: isSelected ? '#fff' : isToday ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: '0.6rem', opacity: 0.85 }}>{workoutShortLabel(workout)}</span>
              <span style={{ fontSize: '0.65rem', lineHeight: 1 }}>
                {status === 'done' ? '✓' : status === 'skipped' ? '−' : workout === 'Rest' ? '·' : '○'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected day actions */}
      <div className="flex flex-col gap-2 rounded-lg p-2.5" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
            {DAY_LABELS[selectedIsoDay - 1]} · {effectiveWorkout}
            {hasOverride && <span className="ml-1 font-normal opacity-60">(swapped)</span>}
          </p>
          {statusForDay && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: statusForDay === 'done' ? 'var(--accent)' : 'var(--danger)', color: '#fff', opacity: 0.9 }}
            >
              {statusForDay === 'done' ? '✓ Done' : '− Skipped'}
            </span>
          )}
        </div>

        {effectiveWorkout !== 'Rest' && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setDayStatus(selectedDate, statusForDay === 'done' ? null : 'done')}
              className="text-xs px-2.5 py-1 rounded-md font-medium transition-opacity hover:opacity-80"
              style={{
                backgroundColor: statusForDay === 'done' ? 'var(--accent)' : 'var(--bg)',
                border: '1px solid var(--accent)',
                color: statusForDay === 'done' ? '#fff' : 'var(--accent)',
              }}
            >
              {statusForDay === 'done' ? '✓ Done' : 'Mark Done'}
            </button>
            <button
              onClick={() => setDayStatus(selectedDate, statusForDay === 'skipped' ? null : 'skipped')}
              className="text-xs px-2.5 py-1 rounded-md font-medium transition-opacity hover:opacity-80"
              style={{
                backgroundColor: statusForDay === 'skipped' ? 'var(--danger)' : 'var(--bg)',
                border: `1px solid ${statusForDay === 'skipped' ? 'var(--danger)' : 'var(--card-border)'}`,
                color: statusForDay === 'skipped' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {statusForDay === 'skipped' ? '− Skipped' : 'Skip'}
            </button>
            {!hasOverride && (
              <button
                onClick={() => setShowSwapPicker(p => !p)}
                className="text-xs px-2.5 py-1 rounded-md font-medium transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: showSwapPicker ? 'var(--accent-secondary)' : 'var(--bg)',
                  border: '1px solid var(--card-border)',
                  color: 'var(--text-secondary)',
                }}
              >
                ⇄ Swap
              </button>
            )}
            {hasOverride && (
              <button
                onClick={() => clearOverride(selectedDate)}
                className="text-xs px-2.5 py-1 rounded-md font-medium transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--card-border)', color: 'var(--text-secondary)' }}
              >
                ↺ Reset
              </button>
            )}
          </div>
        )}

        {/* Swap picker */}
        {showSwapPicker && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            <p className="w-full text-xs" style={{ color: 'var(--text-secondary)' }}>Do this day&rsquo;s workout instead:</p>
            {DAY_LABELS.map((lbl, idx) => {
              const isoDay = idx + 1;
              if (isoDay === selectedIsoDay) return null;
              const date = dateForIsoDay(isoDay);
              const workout = getWorkoutFor(date, isoToJs(isoDay));
              if (workout === 'Rest') return null;
              return (
                <button
                  key={lbl}
                  onClick={() => { swapDay(selectedDate, workout); setShowSwapPicker(false); }}
                  className="text-xs px-2 py-1 rounded-md transition-opacity hover:opacity-80"
                  style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--card-border)', color: 'var(--text)' }}
                >
                  {lbl}: {workoutShortLabel(workout)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content area */}
      {effectiveWorkout === 'Rest' ? (
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-lg py-6 px-3 text-center"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }}
          role="status"
        >
          <div style={{ color: 'var(--text-secondary)' }} aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Recovery Day</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Muscles grow at rest. Take it easy.</p>
        </div>
      ) : effectiveWorkout === 'Run' ? (
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-lg py-5 px-3 text-center"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }}
          role="status"
        >
          <div style={{ color: 'var(--accent)' }} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="4" r="1.5" />
              <path d="M8 20l2-6 2 3 3-7 1 4h2" />
              <path d="M6 12l2-3 2 1 2-3" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Run Day</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Target: 5k @ 4:14/km pace</p>
          {statusForDay && (
            <p className="text-xs font-medium" style={{ color: statusForDay === 'done' ? 'var(--accent)' : 'var(--danger)' }}>
              {statusForDay === 'done' ? '✓ Run logged' : '− Run skipped'}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2" role="list" aria-label="Exercises">
          {exerciseList.map((exercise) => (
            <div key={exercise.name} role="listitem">
              <ExerciseCard
                exercise={exercise}
                loggedSets={getLoggedSets(exercise.name)}
                history={getHistoryWeights(exercise.name)}
                onLogSet={handleLogSet}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
