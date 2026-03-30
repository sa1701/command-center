'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePomodoroStore } from '@/lib/widget-store';

// ---------------------------------------------------------------------------
// Web Audio beep — no external files needed
// ---------------------------------------------------------------------------

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
    osc.onended = () => ctx.close();
  } catch {
    // Audio not available in this environment — fail silently
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WORK_SESSIONS_PER_CYCLE = 4;
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ---------------------------------------------------------------------------
// PomodoroTimer Widget
// ---------------------------------------------------------------------------

export default function PomodoroTimer() {
  const {
    timeLeft,
    isRunning,
    isBreak,
    sessions,
    workDuration,
    breakDuration,
    start,
    pause,
    reset,
    tick,
  } = usePomodoroStore();

  const prevRunning = useRef(isRunning);
  const prevTimeLeft = useRef(timeLeft);

  // Tick every second while running
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isRunning, tick]);

  // Beep when timer hits zero
  useEffect(() => {
    if (prevTimeLeft.current > 0 && timeLeft === 0) {
      playBeep();
    }
    prevTimeLeft.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    prevRunning.current = isRunning;
  }, [isRunning]);

  const totalDuration = isBreak ? breakDuration : workDuration;
  const progress = timeLeft / totalDuration;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const ringColor = isBreak ? '#22c55e' : 'var(--accent)';
  const sessionDisplay = `Session ${(sessions % WORK_SESSIONS_PER_CYCLE) + 1}/${WORK_SESSIONS_PER_CYCLE}`;

  const handleToggle = useCallback(() => {
    if (isRunning) { pause(); } else { start(); }
  }, [isRunning, pause, start]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-2">
      {/* Mode badge */}
      <div
        className="text-xs font-semibold uppercase tracking-widest px-3 py-0.5 rounded-full border"
        style={{
          color: isBreak ? '#22c55e' : 'var(--accent)',
          borderColor: isBreak ? '#22c55e' : 'var(--accent)',
        }}
        aria-label={isBreak ? 'Break mode' : 'Work mode'}
      >
        {isBreak ? 'Break' : 'Focus'}
      </div>

      {/* Circular timer */}
      <div className="relative" aria-label={`Time remaining: ${formatTime(timeLeft)}`}>
        <svg
          width="140"
          height="140"
          viewBox="0 0 120 120"
          role="img"
          aria-hidden
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="var(--card-border)"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
          />
        </svg>

        {/* Time label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-mono text-3xl font-bold tabular-nums"
            style={{ color: 'var(--text)' }}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Session counter */}
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {sessionDisplay} &mdash; {sessions} completed today
      </p>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={handleToggle}
          className="px-5 py-2 rounded font-semibold text-sm transition-opacity hover:opacity-80"
          style={{ background: ringColor, color: 'var(--bg)' }}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>

        <button
          onClick={reset}
          className="px-4 py-2 rounded text-sm border transition-opacity hover:opacity-80"
          style={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
          aria-label="Reset timer"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
