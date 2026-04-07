'use client';

import { useState, useCallback } from 'react';
import { useProjectStore } from '@/lib/widget-store';

type ProjectStatus = 'not_started' | 'in_progress' | 'complete';

const STATUS_CYCLE: ProjectStatus[] = ['not_started', 'in_progress', 'complete'];

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; bg: string; color: string }
> = {
  not_started: {
    label: 'Not Started',
    bg: 'rgba(100,100,100,0.15)',
    color: 'var(--text-secondary)',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'rgba(var(--accent-rgb, 99,102,241), 0.15)',
    color: 'var(--accent)',
  },
  complete: {
    label: 'Complete',
    bg: 'rgba(34,197,94,0.15)',
    color: '#22c55e',
  },
};

function cycleStatus(current: ProjectStatus): ProjectStatus {
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

interface CircularProgressProps {
  pct: number;
  size?: number;
  stroke?: number;
}

function CircularProgress({ pct, size = 52, stroke = 5 }: CircularProgressProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className="shrink-0"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--card-border)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.4s ease' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fontWeight="600"
        fill="var(--text)"
      >
        {pct}%
      </text>
    </svg>
  );
}

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  techStack: string[];
  githubUrl?: string;
  onUpdate: (id: string, updates: Partial<{ status: ProjectStatus; progress: number }>) => void;
}

function ProjectCard({
  id,
  name,
  description,
  status,
  progress,
  techStack,
  githubUrl,
  onUpdate,
}: ProjectCardProps) {
  const [editing, setEditing] = useState(false);
  const cfg = STATUS_CONFIG[status];

  const handleCycleStatus = useCallback(() => {
    onUpdate(id, { status: cycleStatus(status) });
  }, [id, status, onUpdate]);

  const handleProgressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(id, { progress: Number(e.target.value) });
    },
    [id, onUpdate]
  );

  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-2"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--card-border)',
      }}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className="text-sm font-semibold truncate"
            style={{ color: 'var(--text)' }}
            title={name}
          >
            {name}
          </span>
          <span
            className="text-xs leading-snug line-clamp-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {description}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${name} on GitHub`}
              className="rounded-md p-1 transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2"
              style={{ color: 'var(--text-secondary)' }}
              title="View on GitHub"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          )}
          <button
            onClick={() => setEditing((v) => !v)}
            aria-label={editing ? 'Close editor' : 'Edit project'}
            className="rounded-md p-1 text-xs transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2"
            style={{ color: 'var(--text-secondary)' }}
            title="Edit"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Status badge + progress label */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-medium rounded-full px-2 py-0.5"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          {cfg.label}
        </span>
        <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="w-full rounded-full h-1.5 overflow-hidden"
        style={{ background: 'var(--card-border)' }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${name} progress`}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, background: 'var(--accent)' }}
        />
      </div>

      {/* Tech stack tags */}
      {techStack.length > 0 && (
        <div className="flex flex-wrap gap-1" role="list" aria-label="Tech stack">
          {techStack.map((tech) => (
            <span
              key={tech}
              role="listitem"
              className="text-xs rounded px-1.5 py-0.5"
              style={{
                background: 'var(--card-border)',
                color: 'var(--text-secondary)',
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Inline editor */}
      {editing && (
        <div
          className="flex flex-col gap-2 pt-2 mt-1"
          style={{ borderTop: '1px solid var(--card-border)' }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Status
            </span>
            <button
              onClick={handleCycleStatus}
              className="text-xs rounded-full px-2 py-0.5 transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2"
              style={{ background: cfg.bg, color: cfg.color }}
              aria-label="Cycle project status"
            >
              {cfg.label} →
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>
              Progress
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={handleProgressChange}
              aria-label="Adjust project progress"
              className="flex-1 accent-[var(--accent)] h-1 cursor-pointer"
            />
            <span className="text-xs w-8 text-right font-mono" style={{ color: 'var(--text)' }}>
              {progress}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectProgress() {
  const { projects, updateProject } = useProjectStore();

  const overallPct =
    projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0;

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--card-border)',
        color: 'var(--text)',
      }}
    >
      {/* Header with circular progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            🗂️
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Projects
            </span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Portfolio: {overallPct}% Complete
            </span>
          </div>
        </div>
        <CircularProgress
          pct={overallPct}
          aria-label={`Overall portfolio completion: ${overallPct}%`}
        />
      </div>

      {/* Project cards */}
      {projects.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: 'var(--text-secondary)' }}>
          No projects found.
        </p>
      ) : (
        <div className="flex flex-col gap-2" role="list" aria-label="Project list">
          {projects.slice(0, 4).map((project) => (
            <div key={project.id} role="listitem">
              <ProjectCard
                id={project.id}
                name={project.name}
                description={project.description}
                status={project.status}
                progress={project.progress}
                techStack={project.techStack}
                githubUrl={project.githubUrl}
                onUpdate={updateProject}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/*
Usage Example:
  import ProjectProgress from '@/components/widgets/ProjectProgress';

  export default function DashboardPage() {
    return (
      <div className="grid grid-cols-3 gap-4">
        <ProjectProgress />
      </div>
    );
  }
*/
