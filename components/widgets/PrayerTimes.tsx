'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePrayerStore } from '@/lib/widget-store';

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function getNowInMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function formatCountdown(diffMinutes: number): string {
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  if (hours > 0) return `in ${hours}hr ${minutes}min`;
  return `in ${minutes}min`;
}

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getNextPrayer(times: { name: string; time: string }[]): {
  index: number;
  diffMinutes: number;
} | null {
  const nowMinutes = getNowInMinutes();
  for (let i = 0; i < times.length; i++) {
    const prayerMinutes = parseTimeToMinutes(times[i].time);
    if (prayerMinutes > nowMinutes) {
      return { index: i, diffMinutes: prayerMinutes - nowMinutes };
    }
  }
  // All prayers passed — next is Fajr tomorrow
  const fajrMinutes = parseTimeToMinutes(times[0].time);
  const minutesUntilMidnight = 24 * 60 - nowMinutes;
  return { index: 0, diffMinutes: minutesUntilMidnight + fajrMinutes };
}

export default function PrayerTimes() {
  const { times, lastFetchDate, loading, error, setTimes, setLoading, setError } =
    usePrayerStore();

  const midnightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPrayerTimes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        'https://api.aladhan.com/v1/timingsByCity?city=Sydney&country=Australia&method=2'
      );
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      const timings = json?.data?.timings;
      if (!timings) throw new Error('Unexpected API response shape');

      const parsed = PRAYER_NAMES.map((name) => ({
        name,
        time: (timings[name] as string).slice(0, 5), // strip seconds if present
      }));

      setTimes(parsed, getTodayString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prayer times');
    } finally {
      setLoading(false);
    }
  }, [setTimes, setLoading, setError]);

  const scheduleMidnightRefresh = useCallback(() => {
    if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    midnightTimerRef.current = setTimeout(() => {
      fetchPrayerTimes();
      scheduleMidnightRefresh();
    }, msUntilMidnight);
  }, [fetchPrayerTimes]);

  useEffect(() => {
    const today = getTodayString();
    if (lastFetchDate !== today) {
      fetchPrayerTimes();
    }
    scheduleMidnightRefresh();
    return () => {
      if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);
    };
  }, [fetchPrayerTimes, lastFetchDate, scheduleMidnightRefresh]);

  const nextPrayer = times.length > 0 ? getNextPrayer(times) : null;

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--card-border)',
        color: 'var(--text)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            🕌
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Prayer Times
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Sydney / Wollongong
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-6">
          <div
            className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
            role="status"
            aria-label="Loading prayer times"
          />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          className="text-xs rounded-lg px-3 py-2 text-center"
          style={{ background: 'rgba(var(--danger-rgb, 239,68,68), 0.1)', color: 'var(--danger)' }}
          role="alert"
        >
          {error}
          <button
            onClick={fetchPrayerTimes}
            className="block mx-auto mt-1 underline text-xs"
            style={{ color: 'var(--accent)' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Prayer list */}
      {!loading && !error && times.length > 0 && (
        <ul className="flex flex-col gap-1" role="list" aria-label="Prayer times">
          {times.map((prayer, i) => {
            const isNext = nextPrayer?.index === i;
            return (
              <li
                key={prayer.name}
                className="flex items-center justify-between rounded-xl px-3 py-2 transition-all"
                style={
                  isNext
                    ? {
                        background: 'var(--accent)',
                        color: '#fff',
                      }
                    : {
                        background: 'transparent',
                        color: 'var(--text)',
                      }
                }
                aria-current={isNext ? 'true' : undefined}
              >
                <span className="text-sm font-medium">{prayer.name}</span>
                <div className="flex items-center gap-2">
                  {isNext && nextPrayer && (
                    <span className="text-xs opacity-80">
                      {formatCountdown(nextPrayer.diffMinutes)}
                    </span>
                  )}
                  <span className="text-sm font-mono font-semibold">{prayer.time}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Empty state */}
      {!loading && !error && times.length === 0 && (
        <p className="text-xs text-center py-4" style={{ color: 'var(--text-secondary)' }}>
          No prayer times loaded.
        </p>
      )}
    </div>
  );
}

/*
Usage Example:
  import PrayerTimes from '@/components/widgets/PrayerTimes';

  export default function DashboardPage() {
    return (
      <div className="grid grid-cols-3 gap-4">
        <PrayerTimes />
      </div>
    );
  }
*/
