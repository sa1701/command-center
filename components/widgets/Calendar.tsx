'use client';

import { useState, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  format,
} from 'date-fns';
import { useCalendarStore } from '@/lib/widget-store';

// ---------------------------------------------------------------------------
// Calendar Widget
// ---------------------------------------------------------------------------

const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function Calendar() {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEventText, setNewEventText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const { events, addEvent, removeEvent, updateEvent } = useCalendarStore();

  const days = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    // Start week on Monday (weekStartsOn: 1)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [viewDate]);

  const selectedKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedEvents = events.filter((e) => e.date === selectedKey);

  function handleAddEvent() {
    if (!selectedDate || !newEventText.trim()) return;
    addEvent(format(selectedDate, 'yyyy-MM-dd'), newEventText.trim());
    setNewEventText('');
  }

  function dayHasEvents(day: Date) {
    return events.some((e) => e.date === format(day, 'yyyy-MM-dd'));
  }

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <button
          onClick={() => setViewDate(subMonths(viewDate, 1))}
          className="p-1 rounded hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Previous month"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          {format(viewDate, 'MMMM yyyy')}
        </h2>

        <button
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="p-1 rounded hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Next month"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 shrink-0" role="row" aria-label="Days of week">
        {DAY_HEADERS.map((d, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium py-1"
            style={{ color: 'var(--text-secondary)' }}
            aria-hidden
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        className="grid grid-cols-7 gap-y-0.5 shrink-0"
        role="grid"
        aria-label={`Calendar for ${format(viewDate, 'MMMM yyyy')}`}
      >
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, viewDate);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const today = isToday(day);
          const hasEvents = dayHasEvents(day);

          return (
            <button
              key={day.toISOString()}
              role="gridcell"
              aria-label={format(day, 'EEEE, MMMM d')}
              aria-pressed={isSelected}
              aria-current={today ? 'date' : undefined}
              onClick={() => setSelectedDate(isSameDay(day, selectedDate ?? new Date(0)) ? null : day)}
              className="relative flex flex-col items-center py-1 rounded text-xs font-medium transition-colors"
              style={{
                color: !isCurrentMonth
                  ? 'var(--text-secondary)'
                  : today && !isSelected
                  ? 'var(--accent)'
                  : isSelected
                  ? 'var(--bg)'
                  : 'var(--text)',
                background: isSelected
                  ? 'var(--accent)'
                  : today && !isSelected
                  ? 'color-mix(in srgb, var(--accent) 15%, transparent)'
                  : 'transparent',
                opacity: isCurrentMonth ? 1 : 0.4,
                fontWeight: today || isSelected ? 700 : 400,
              }}
            >
              {format(day, 'd')}
              {hasEvents && (
                <span
                  className="absolute bottom-0.5 w-1 h-1 rounded-full"
                  style={{ background: isSelected ? 'var(--bg)' : 'var(--accent)' }}
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Events panel */}
      {selectedDate && (
        <div
          className="flex-1 overflow-y-auto border-t pt-3 min-h-0"
          style={{ borderColor: 'var(--card-border)' }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
            {format(selectedDate, 'EEEE, MMMM d')}
          </p>

          {selectedEvents.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              No events. Add one below.
            </p>
          ) : (
            <ul className="space-y-1 mb-2">
              {selectedEvents.map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-center gap-2 text-xs group"
                  style={{ color: 'var(--text)' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: 'var(--accent)' }}
                    aria-hidden
                  />
                  {editingId === ev.id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { updateEvent(ev.id, editText); setEditingId(null); }
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={() => { if (editText.trim()) updateEvent(ev.id, editText); setEditingId(null); }}
                      autoFocus
                      className="flex-1 bg-transparent border-b text-xs outline-none"
                      style={{ borderColor: 'var(--accent)', color: 'var(--text)' }}
                      aria-label={`Edit event: ${ev.text}`}
                    />
                  ) : (
                    <span
                      className="flex-1 cursor-pointer"
                      onClick={() => { setEditingId(ev.id); setEditText(ev.text); }}
                      title="Click to edit"
                    >
                      {ev.text}
                    </span>
                  )}
                  <button
                    onClick={() => removeEvent(ev.id)}
                    className="opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--danger)' }}
                    aria-label={`Remove event: ${ev.text}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Add event */}
          <div className="flex gap-1 mt-2">
            <input
              type="text"
              value={newEventText}
              onChange={(e) => setNewEventText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddEvent()}
              placeholder="Add event..."
              className="flex-1 bg-transparent border rounded px-2 py-1 text-xs outline-none"
              style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
              aria-label="New event text"
            />
            <button
              onClick={handleAddEvent}
              disabled={!newEventText.trim()}
              className="px-2 py-1 rounded text-xs font-medium disabled:opacity-40 transition-opacity"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}
              aria-label="Add event"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
