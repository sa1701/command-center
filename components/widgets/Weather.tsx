'use client';

import { useState, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// WMO weather code mapping
// Codes: https://open-meteo.com/en/docs#weathervariables
// ---------------------------------------------------------------------------

interface WeatherInfo {
  emoji: string;
  label: string;
}

function getWeatherInfo(code: number): WeatherInfo {
  if (code === 0) return { emoji: '☀️', label: 'Clear sky' };
  if (code <= 2) return { emoji: '⛅', label: 'Partly cloudy' };
  if (code === 3) return { emoji: '☁️', label: 'Overcast' };
  if (code <= 49) return { emoji: '🌫️', label: 'Fog' };
  if (code <= 59) return { emoji: '🌦️', label: 'Drizzle' };
  if (code <= 69) return { emoji: '🌧️', label: 'Rain' };
  if (code <= 79) return { emoji: '❄️', label: 'Snow' };
  if (code <= 82) return { emoji: '🌧️', label: 'Rain showers' };
  if (code <= 86) return { emoji: '🌨️', label: 'Snow showers' };
  if (code <= 99) return { emoji: '⛈️', label: 'Thunderstorm' };
  return { emoji: '🌡️', label: 'Unknown' };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WeatherData {
  current: {
    temperature_2m: number;
    weathercode: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
  };
}

// ---------------------------------------------------------------------------
// API URL
// ---------------------------------------------------------------------------

const API_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=-33.8862&longitude=151.1987&current=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Australia%2FSydney&forecast_days=3';

const LOCATION = 'Chippendale, Sydney';

// ---------------------------------------------------------------------------
// Weather Widget
// ---------------------------------------------------------------------------

export default function Weather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: WeatherData = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    // Refresh every 10 minutes
    const id = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchWeather]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-sm animate-pulse" style={{ color: 'var(--text-secondary)' }}>
          Fetching weather...
        </span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-sm" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
        <button
          onClick={fetchWeather}
          className="px-3 py-1.5 rounded text-xs border transition-opacity hover:opacity-80"
          style={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
          aria-label="Retry fetching weather"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentInfo = data ? getWeatherInfo(data.current.weathercode) : null;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Current weather */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-4xl" aria-hidden>
            {currentInfo?.emoji}
          </span>
          <div>
            <p
              className="text-4xl font-bold font-mono leading-none"
              style={{ color: 'var(--accent)' }}
              aria-label={`Current temperature: ${data?.current.temperature_2m}°C`}
            >
              {data?.current.temperature_2m}°C
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {currentInfo?.label}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>
            {LOCATION}
          </p>
          <button
            onClick={fetchWeather}
            disabled={loading}
            className="mt-1 text-xs transition-opacity hover:opacity-70 disabled:opacity-40 flex items-center gap-1 ml-auto"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Refresh weather data"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={loading ? 'animate-spin' : ''}
              aria-hidden
            >
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* 3-day forecast */}
      {data && (
        <div
          className="grid grid-cols-3 gap-2 shrink-0 border-t pt-3"
          style={{ borderColor: 'var(--card-border)' }}
          aria-label="3-day forecast"
        >
          {data.daily.time.map((dateStr, i) => {
            const info = getWeatherInfo(data.daily.weathercode[i]);
            const date = new Date(dateStr + 'T00:00:00');
            const dayLabel =
              i === 0
                ? 'Today'
                : date.toLocaleDateString('en-AU', { weekday: 'short' });

            return (
              <div
                key={dateStr}
                className="flex flex-col items-center gap-1 py-2 rounded border"
                style={{ borderColor: 'var(--card-border)', background: 'var(--bg-secondary)' }}
                aria-label={`${dayLabel}: ${info.label}, high ${data.daily.temperature_2m_max[i]}°C, low ${data.daily.temperature_2m_min[i]}°C`}
              >
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {dayLabel}
                </span>
                <span className="text-xl" aria-hidden>
                  {info.emoji}
                </span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                  {Math.round(data.daily.temperature_2m_max[i])}°
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {Math.round(data.daily.temperature_2m_min[i])}°
                </span>
              </div>
            );
          })}
        </div>
      )}

      {lastUpdated && (
        <p className="text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>
          Updated {lastUpdated.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
}
