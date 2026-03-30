'use client';

import { useState, useMemo } from 'react';
import { useGradeStore, type Grade } from '@/lib/widget-store';

// ---------------------------------------------------------------------------
// Grade band config
// ---------------------------------------------------------------------------

interface Band {
  label: string;
  min: number;
  color: string;
}

const BANDS: Band[] = [
  { label: 'HD', min: 85, color: '#a855f7' },
  { label: 'D',  min: 75, color: '#3b82f6' },
  { label: 'C',  min: 65, color: '#22c55e' },
  { label: 'P',  min: 50, color: '#f59e0b' },
  { label: 'F',  min: 0,  color: 'var(--danger)' },
];

function getBand(grade: number): Band {
  return BANDS.find((b) => grade >= b.min) ?? BANDS[BANDS.length - 1];
}

// ---------------------------------------------------------------------------
// WAM calculation: sum(grade * credits) / sum(credits)
// ---------------------------------------------------------------------------

function calcWAM(grades: Grade[]): number | null {
  if (grades.length === 0) return null;
  const totalCredits = grades.reduce((s, g) => s + g.credits, 0);
  if (totalCredits === 0) return null;
  const weighted = grades.reduce((s, g) => s + g.grade * g.credits, 0);
  return weighted / totalCredits;
}

// ---------------------------------------------------------------------------
// GradeTracker Widget
// ---------------------------------------------------------------------------

export default function GradeTracker() {
  const { grades, addGrade, removeGrade } = useGradeStore();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [gradeVal, setGradeVal] = useState('');
  const [credits, setCredits] = useState('6');

  const wam = useMemo(() => calcWAM(grades), [grades]);
  const wamBand = wam !== null ? getBand(Math.round(wam)) : null;

  function handleAdd() {
    const g = parseFloat(gradeVal);
    const c = parseFloat(credits);
    if (!subject.trim() || isNaN(g) || isNaN(c) || g < 0 || g > 100 || c <= 0) return;
    addGrade(subject.trim(), g, c);
    setSubject('');
    setGradeVal('');
    setCredits('6');
    setShowForm(false);
  }

  return (
    <div className="flex flex-col h-full gap-3">
      {/* WAM display */}
      {wam !== null && (
        <div
          className="flex items-center justify-between px-3 py-2 rounded border shrink-0"
          style={{ borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--card-bg) 60%, transparent)' }}
        >
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Weighted Average Mark
          </span>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ background: wamBand?.color, color: '#fff' }}
              aria-label={`Grade band: ${wamBand?.label}`}
            >
              {wamBand?.label}
            </span>
            <span
              className="text-xl font-bold font-mono"
              style={{ color: wamBand?.color }}
              aria-label={`WAM: ${wam.toFixed(1)}`}
            >
              {wam.toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {grades.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: 'var(--text-secondary)' }}>
            No grades yet.
          </p>
        ) : (
          <table className="w-full text-sm" aria-label="Grade table">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                <th className="text-left pb-1.5 font-medium text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Subject
                </th>
                <th className="text-center pb-1.5 font-medium text-xs w-16" style={{ color: 'var(--text-secondary)' }}>
                  Grade
                </th>
                <th className="text-center pb-1.5 font-medium text-xs w-12" style={{ color: 'var(--text-secondary)' }}>
                  Credits
                </th>
                <th className="w-6" />
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => {
                const band = getBand(g.grade);
                return (
                  <tr key={g.id} className="group border-b" style={{ borderColor: 'var(--card-border)' }}>
                    <td className="py-2 pr-2">
                      <div className="flex flex-col gap-0.5">
                        <span style={{ color: 'var(--text)' }} className="text-xs font-medium">
                          {g.subject}
                        </span>
                        {/* Progress bar */}
                        <div
                          className="h-1.5 rounded-full overflow-hidden w-full"
                          style={{ background: 'var(--card-border)' }}
                          role="progressbar"
                          aria-valuenow={g.grade}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${g.subject}: ${g.grade}%`}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${g.grade}%`, background: band.color }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2 text-center">
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{ background: band.color, color: '#fff' }}
                        aria-label={`${g.grade} — ${band.label}`}
                      >
                        {g.grade}
                      </span>
                    </td>
                    <td className="py-2 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {g.credits}
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => removeGrade(g.id)}
                        className="opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--danger)' }}
                        aria-label={`Remove ${g.subject}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add form */}
      {showForm ? (
        <div
          className="flex flex-col gap-2 pt-3 border-t shrink-0"
          style={{ borderColor: 'var(--card-border)' }}
        >
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject name"
            className="w-full bg-transparent border rounded px-2 py-1 text-xs outline-none"
            style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
            aria-label="Subject name"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={gradeVal}
              onChange={(e) => setGradeVal(e.target.value)}
              placeholder="Grade (0-100)"
              min={0}
              max={100}
              className="flex-1 bg-transparent border rounded px-2 py-1 text-xs outline-none"
              style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
              aria-label="Grade value"
            />
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              placeholder="Credits"
              min={1}
              className="w-20 bg-transparent border rounded px-2 py-1 text-xs outline-none"
              style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
              aria-label="Credits"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 py-1 rounded text-xs font-medium"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}
              aria-label="Save grade"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-1 rounded text-xs border"
              style={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
              aria-label="Cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="shrink-0 w-full py-1.5 rounded text-xs border transition-opacity hover:opacity-80"
          style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          aria-label="Add new grade"
        >
          + Add Subject
        </button>
      )}
    </div>
  );
}
