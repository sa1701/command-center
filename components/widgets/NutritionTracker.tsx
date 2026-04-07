'use client';

import { useRef, useCallback } from 'react';
import { useNutritionStore } from '@/lib/widget-store';

const GLASS_COUNT = 8;
const LONG_PRESS_MS = 500;

interface GlassIconProps {
  filled: boolean;
  index: number;
  onAdd: () => void;
  onRemove: () => void;
}

function GlassIcon({ filled, index, onAdd, onRemove }: GlassIconProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const handlePointerDown = () => {
    didLongPress.current = false;
    timerRef.current = setTimeout(() => {
      didLongPress.current = true;
      onRemove();
    }, LONG_PRESS_MS);
  };

  const handlePointerUp = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!didLongPress.current) onAdd();
  };

  const handlePointerLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onRemove();
  };

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onContextMenu={handleContextMenu}
      className="transition-transform active:scale-90 focus:outline-none focus-visible:ring-2 rounded"
      style={{ color: filled ? 'var(--accent)' : 'var(--text-secondary)', lineHeight: 1 }}
      aria-label={filled ? `Glass ${index + 1}: filled. Long-press or right-click to remove` : `Glass ${index + 1}: empty. Tap to add`}
      title={filled ? 'Long-press or right-click to remove' : 'Tap to add'}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M5 2h14l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 2z" />
        <path d="M5 7h14" strokeDasharray={filled ? '0' : '3 2'} />
      </svg>
    </button>
  );
}

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
}

function ProgressBar({ value, max, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div
      className="w-full rounded-full h-2 overflow-hidden"
      style={{ background: 'var(--card-border)' }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, background: 'var(--accent)' }}
      />
    </div>
  );
}

interface NumberInputProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  label: string;
}

function NumberInput({ value, onChange, min = 0, max = 99999, label }: NumberInputProps) {
  return (
    <input
      type="number"
      value={value === 0 ? '' : value}
      min={min}
      max={max}
      placeholder="0"
      aria-label={label}
      onChange={(e) => {
        const parsed = parseInt(e.target.value, 10);
        if (!isNaN(parsed)) onChange(Math.max(min, Math.min(max, parsed)));
        else if (e.target.value === '') onChange(0);
      }}
      className="w-20 text-sm font-mono rounded-lg px-2 py-1 text-right focus:outline-none focus-visible:ring-2"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--card-border)',
        color: 'var(--text)',
      }}
    />
  );
}

const SECTION_DIVIDER = (
  <div className="w-full h-px" style={{ background: 'var(--card-border)' }} aria-hidden="true" />
);

export default function NutritionTracker() {
  const store = useNutritionStore();
  const today = store.getToday();

  const { water, protein, calories } = today;
  const { waterTarget, proteinTarget, calorieTarget } = store;

  const handleProteinChange = useCallback(
    (val: number) => store.setProtein(val),
    [store]
  );

  const handleCaloriesChange = useCallback(
    (val: number) => store.setCalories(val),
    [store]
  );

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
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">
          🥗
        </span>
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          Nutrition Tracker
        </span>
      </div>

      {/* Water Section */}
      <section aria-labelledby="water-label">
        <div className="flex items-center justify-between mb-2">
          <span
            id="water-label"
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}
          >
            Water
          </span>
          <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            {water} / {waterTarget} glasses
          </span>
        </div>
        <div className="flex items-center gap-1 flex-wrap" role="group" aria-label="Water glasses">
          {Array.from({ length: GLASS_COUNT }).map((_, i) => (
            <GlassIcon
              key={i}
              index={i}
              filled={i < water}
              onAdd={() => store.addWater()}
              onRemove={() => store.removeWater()}
            />
          ))}
        </div>
      </section>

      {SECTION_DIVIDER}

      {/* Protein Section */}
      <section aria-labelledby="protein-label">
        <div className="flex items-center justify-between mb-2">
          <span
            id="protein-label"
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}
          >
            Protein
          </span>
          <div className="flex items-center gap-2">
            <NumberInput
              value={protein}
              onChange={handleProteinChange}
              max={999}
              label="Protein intake in grams"
            />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              / {proteinTarget}g
            </span>
          </div>
        </div>
        <ProgressBar value={protein} max={proteinTarget} label={`Protein progress: ${protein}g of ${proteinTarget}g`} />
      </section>

      {SECTION_DIVIDER}

      {/* Calories Section */}
      <section aria-labelledby="calories-label">
        <div className="flex items-center justify-between mb-2">
          <span
            id="calories-label"
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}
          >
            Calories
          </span>
          <div className="flex items-center gap-2">
            <NumberInput
              value={calories}
              onChange={handleCaloriesChange}
              max={9999}
              label="Calorie intake"
            />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              / {calorieTarget} kcal
            </span>
          </div>
        </div>
        <ProgressBar
          value={calories}
          max={calorieTarget}
          label={`Calorie progress: ${calories} of ${calorieTarget} kcal`}
        />
      </section>
    </div>
  );
}

/*
Usage Example:
  import NutritionTracker from '@/components/widgets/NutritionTracker';

  export default function DashboardPage() {
    return (
      <div className="grid grid-cols-3 gap-4">
        <NutritionTracker />
      </div>
    );
  }
*/
