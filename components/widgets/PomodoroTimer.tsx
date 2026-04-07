'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
    isMuted,
    start,
    pause,
    reset,
    tick,
    setWorkDuration,
    setBreakDuration,
    toggleMute,
  } = usePomodoroStore();

  const [showSettings, setShowSettings] = useState(false);

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
    if (prevTimeLeft.current > 0 && timeLeft === 0 && !isMuted) {
      playBeep();
    }
    prevTimeLeft.current = timeLeft;
  }, [timeLeft, isMuted]);

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

        <button
          onClick={() => setShowSettings((v) => !v)}
          className="px-3 py-2 rounded text-sm border transition-opacity hover:opacity-80"
          style={{
            borderColor: showSettings ? 'var(--accent)' : 'var(--card-border)',
            color: showSettings ? 'var(--accent)' : 'var(--text-secondary)',
          }}
          aria-label="Timer settings"
          aria-expanded={showSettings}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full overflow-hidden"
          >
            <div className="border-t pt-3 space-y-3" style={{ borderColor: 'var(--card-border)' }}>
              {/* Work duration presets */}
              <div>
                <p className="text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>Work Duration</p>
                <div className="flex gap-1.5">
                  {[15, 25, 30, 45, 60].map((min) => (
                    <button
                      key={min}
                      onClick={() => setWorkDuration(min * 60)}
                      className="px-2 py-1 rounded text-xs transition-colors"
                      style={{
                        background: workDuration === min * 60 ? 'var(--accent)' : 'transparent',
                        color: workDuration === min * 60 ? 'var(--bg)' : 'var(--text-secondary)',
                        border: `1px solid ${workDuration === min * 60 ? 'var(--accent)' : 'var(--card-border)'}`,
                      }}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Break duration presets */}
              <div>
                <p className="text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>Break Duration</p>
                <div className="flex gap-1.5">
                  {[5, 10, 15].map((min) => (
                    <button
                      key={min}
                      onClick={() => setBreakDuration(min * 60)}
                      className="px-2 py-1 rounded text-xs transition-colors"
                      style={{
                        background: breakDuration === min * 60 ? 'var(--accent)' : 'transparent',
                        color: breakDuration === min * 60 ? 'var(--bg)' : 'var(--text-secondary)',
                        border: `1px solid ${breakDuration === min * 60 ? 'var(--accent)' : 'var(--card-border)'}`,
                      }}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Mute toggle */}
              <button
                onClick={toggleMute}
                className="flex items-center gap-2 text-xs transition-opacity hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
                aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
              >
                {isMuted ? '🔇' : '🔊'} Sound {isMuted ? 'Off' : 'On'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
