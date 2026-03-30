'use client';

import { useState, useMemo } from 'react';
import { format, subDays, eachDayOfInterval, differenceInDays } from 'date-fns';
import { useHabitStore, type Habit } from '@/lib/widget-store';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WEEKS = 12;
const TOTAL_DAYS = WEEKS * 7;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the current streak (consecutive days ending today or yesterday). */
function calcStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  const sorted = [...completedDates].sort().reverse();
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  let streak = 0;
  let cursor = sorted[0] === today || sorted[0] === yesterday ? new Date(sorted[0]) : null;
  if (!cursor) return 0;

  for (const d of sorted) {
    const diff = differenceInDays(cursor, new Date(d));
    if (diff === 0) {
      streak++;
      cursor = subDays(cursor, 1);
    } else if (diff === 1) {
      streak++;
      cursor = new Date(d);
    } else {
      break;
    }
  }
  return streak;
}

// ---------------------------------------------------------------------------
// HabitRow
// ---------------------------------------------------------------------------

function HabitRow({
  habit,
  days,
  onToggle,
  onDelete,
}: {
  habit: Habit;
  days: Date[];
  onToggle: (habitId: string, date: string) => void;
  onDelete: (id: string) => void;
}) {
  const completedSet = useMemo(() => new Set(habit.completedDates), [habit.completedDates]);
  const streak = useMemo(() => calcStreak(habit.completedDates), [habit.completedDates]);

  return (
    <tr className="group">
      {/* Habit name */}
      <td className="pr-3 py-1 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onDelete(habit.id)}
            className="opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity shrink-0"
            style={{ color: 'var(--danger)' }}
            aria-label={`Delete habit: ${habit.name}`}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <span
            className="text-xs font-medium truncate max-w-[90px]"
            style={{ color: 'var(--text)' }}
            title={habit.name}
          >
            {habit.name}
          </span>
          {streak > 0 && (
            <span
              className="text-xs font-bold ml-1"
              style={{ color: 'var(--accent)' }}
              title={`${streak} day streak`}
              aria-label={`${streak} day streak`}
            >
              {streak}
            </span>
          )}
        </div>
      </td>

      {/* Day cells */}
      {days.map((day) => {
        const key = format(day, 'yyyy-MM-dd');
        const done = completedSet.has(key);
        const isToday = key === format(new Date(), 'yyyy-MM-dd');

        return (
          <td key={key} className="p-0.5">
            <button
              onClick={() => onToggle(habit.id, key)}
              className="w-3.5 h-3.5 rounded-sm transition-colors block"
              style={{
                background: done ? 'var(--accent)' : 'var(--card-border)',
                outline: isToday ? '1px solid var(--accent)' : 'none',
                outlineOffset: '1px',
              }}
              aria-label={`${habit.name} on ${key}: ${done ? 'completed' : 'not completed'}. Click to toggle.`}
              aria-pressed={done}
            />
          </td>
        );
      })}
    </tr>
  );
}

// ---------------------------------------------------------------------------
// HabitTracker Widget
// ---------------------------------------------------------------------------

export default function HabitTracker() {
  const { habits, addHabit, toggleHabitDate, deleteHabit } = useHabitStore();
  const [newName, setNewName] = useState('');
  const [showInput, setShowInput] = useState(false);

  const days = useMemo(() => {
    const end = new Date();
    const start = subDays(end, TOTAL_DAYS - 1);
    return eachDayOfInterval({ start, end });
  }, []);

  // Week boundary indices for column headers
  const weekLabels = useMemo(() => {
    return Array.from({ length: WEEKS }, (_, i) => {
      const dayIndex = i * 7;
      return { index: dayIndex, label: format(days[dayIndex], 'MMM d') };
    });
  }, [days]);

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    addHabit(name);
    setNewName('');
    setShowInput(false);
  }

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          Last {WEEKS} Weeks
        </h3>
        <button
          onClick={() => setShowInput(!showInput)}
          className="text-xs px-2 py-0.5 rounded border transition-opacity hover:opacity-80"
          style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          aria-label="Add new habit"
        >
          + Add Habit
        </button>
      </div>

      {/* Add habit input */}
      {showInput && (
        <div className="flex gap-2 shrink-0">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Habit name..."
            autoFocus
            className="flex-1 bg-transparent border rounded px-2 py-1 text-xs outline-none"
            style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
            aria-label="New habit name"
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="px-3 py-1 rounded text-xs font-medium disabled:opacity-40"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
            aria-label="Save new habit"
          >
            Save
          </button>
        </div>
      )}

      {habits.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: 'var(--text-secondary)' }}>
          No habits yet. Add one to get started.
        </p>
      ) : (
        <div className="flex-1 overflow-auto min-h-0">
          <table className="border-separate border-spacing-0" aria-label="Habit tracker grid">
            <thead>
              <tr>
                {/* empty name column */}
                <th className="w-[110px]" />
                {days.map((day, i) => {
                  const wl = weekLabels.find((w) => w.index === i);
                  return (
                    <th key={day.toISOString()} className="p-0.5 font-normal" aria-hidden>
                      {wl ? (
                        <span
                          className="block text-[9px] whitespace-nowrap"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {wl.label}
                        </span>
                      ) : null}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  days={days}
                  onToggle={toggleHabitDate}
                  onDelete={deleteHabit}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
