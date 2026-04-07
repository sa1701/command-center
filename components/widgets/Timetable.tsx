'use client';

import { useState, useEffect } from 'react';
import { useTimetableStore, DayOfWeek, TimetableClass } from '@/lib/widget-store';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function getNowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function getTodayDayName(): DayOfWeek | 'Saturday' | 'Sunday' {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()] as DayOfWeek | 'Saturday' | 'Sunday';
}

function formatCountdown(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface ClassCardProps {
  cls: TimetableClass;
  isActive?: boolean;
  isNext?: boolean;
}

function ClassCard({ cls, isActive, isNext }: ClassCardProps) {
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-secondary)',
    borderLeft: `3px solid ${cls.color ?? 'var(--accent)'}`,
    outline: isActive || isNext ? `1px solid var(--accent)` : '1px solid var(--card-border)',
  };

  return (
    <div
      className="rounded-md px-3 py-2 flex items-start gap-3"
      style={cardStyle}
    >
      <div className="flex flex-col items-end shrink-0 pt-0.5">
        <span className="font-mono text-xs" style={{ color: 'var(--text)' }}>
          {cls.startTime}
        </span>
        <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
          {cls.endTime}
        </span>
      </div>

      <div
        className="w-px self-stretch shrink-0"
        style={{ backgroundColor: 'var(--card-border)' }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: cls.color ?? 'var(--accent)' }}
          />
          <span
            className="text-sm font-semibold truncate"
            style={{ color: 'var(--accent)' }}
          >
            {cls.subject}
          </span>
          {(isActive || isNext) && (
            <span
              className="text-xs px-1.5 py-0.5 rounded shrink-0"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--bg-secondary)',
                fontSize: '0.65rem',
              }}
            >
              {isActive ? 'NOW' : 'NEXT'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {cls.type}
          </span>
          <span className="text-xs" style={{ color: 'var(--card-border)' }}>
            ·
          </span>
          <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
            {cls.location}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Timetable() {
  const { getCurrentWeek, getTodayClasses, getDayClasses } = useTimetableStore();

  const [fullWeekView, setFullWeekView] = useState(false);
  const [activeDay, setActiveDay] = useState<DayOfWeek>('Monday');
  const [now, setNow] = useState<number>(getNowMinutes());
  const [currentWeek] = useState<number>(getCurrentWeek());

  const todayName = getTodayDayName();
  const isWeekend = todayName === 'Saturday' || todayName === 'Sunday';

  useEffect(() => {
    if (!isWeekend) {
      setActiveDay(todayName as DayOfWeek);
    }
  }, [todayName, isWeekend]);

  useEffect(() => {
    const tick = setInterval(() => setNow(getNowMinutes()), 60_000);
    return () => clearInterval(tick);
  }, []);

  const todayClasses: TimetableClass[] = isWeekend ? [] : getTodayClasses();

  const activeClass = todayClasses.find(
    (cls) => parseTime(cls.startTime) <= now && now < parseTime(cls.endTime)
  );

  const nextClass = !activeClass
    ? todayClasses
        .filter((cls) => parseTime(cls.startTime) > now)
        .sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime))[0]
    : undefined;

  const nextClassMinutes = nextClass
    ? parseTime(nextClass.startTime) - now
    : null;

  const displayedClasses: TimetableClass[] = fullWeekView
    ? getDayClasses(activeDay, currentWeek)
    : todayClasses;

  const containerStyle: React.CSSProperties = { color: 'var(--text)' };

  return (
    <div className="flex flex-col gap-3 h-full" style={containerStyle}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Timetable
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded font-mono"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--accent)',
              border: '1px solid var(--card-border)',
            }}
          >
            Wk {currentWeek}
          </span>
        </div>
        <button
          onClick={() => setFullWeekView((v) => !v)}
          className="text-xs px-2 py-1 rounded transition-colors"
          style={{
            backgroundColor: fullWeekView ? 'var(--accent)' : 'var(--bg-secondary)',
            color: fullWeekView ? 'var(--bg-secondary)' : 'var(--text-secondary)',
            border: '1px solid var(--card-border)',
          }}
          aria-pressed={fullWeekView}
          aria-label="Toggle full week view"
        >
          Week view
        </button>
      </div>

      {/* Next class countdown banner */}
      {!fullWeekView && !isWeekend && nextClass && nextClassMinutes !== null && (
        <div
          className="text-xs px-3 py-1.5 rounded flex items-center gap-1.5"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--accent)',
            color: 'var(--text)',
          }}
          role="status"
          aria-live="polite"
        >
          <span style={{ color: 'var(--accent)' }}>Next:</span>
          <span className="font-semibold">{nextClass.subject}</span>
          <span style={{ color: 'var(--text-secondary)' }}>{nextClass.type}</span>
          <span style={{ color: 'var(--text-secondary)' }}>in</span>
          <span className="font-mono font-semibold" style={{ color: 'var(--accent)' }}>
            {formatCountdown(nextClassMinutes)}
          </span>
        </div>
      )}

      {/* Day tabs (full week view only) */}
      {fullWeekView && (
        <div
          className="flex gap-1 rounded-md p-1"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }}
          role="tablist"
          aria-label="Day of week"
        >
          {DAYS.map((day) => {
            const isSelected = activeDay === day;
            const isToday = day === todayName;
            return (
              <button
                key={day}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveDay(day)}
                className="flex-1 text-xs py-1 rounded transition-colors font-medium"
                style={{
                  backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                  color: isSelected
                    ? 'var(--bg-secondary)'
                    : isToday
                    ? 'var(--accent)'
                    : 'var(--text-secondary)',
                  fontWeight: isToday ? 700 : undefined,
                }}
              >
                {day.slice(0, 3)}
              </button>
            );
          })}
        </div>
      )}

      {/* Class list */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {isWeekend && !fullWeekView ? (
          <p
            className="text-sm text-center py-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            No classes today — enjoy your weekend!
          </p>
        ) : displayedClasses.length === 0 ? (
          <p
            className="text-sm text-center py-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            No classes today
          </p>
        ) : (
          displayedClasses.map((cls, idx) => {
            const isActive =
              !fullWeekView &&
              !isWeekend &&
              parseTime(cls.startTime) <= now &&
              now < parseTime(cls.endTime);
            const isNext =
              !fullWeekView &&
              !isWeekend &&
              !activeClass &&
              cls === nextClass;

            return (
              <ClassCard
                key={`${cls.subject}-${cls.startTime}-${idx}`}
                cls={cls}
                isActive={isActive}
                isNext={isNext}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

/*
 * Usage Example:
 *
 * import Timetable from '@/components/widgets/Timetable';
 *
 * export default function DashboardPage() {
 *   return (
 *     <div className="widget-card">
 *       <Timetable />
 *     </div>
 *   );
 * }
 */
