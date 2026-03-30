'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GitHubEvent {
  id: string;
  type: string;
  repo: {
    name: string;
  };
  created_at: string;
  payload: {
    commits?: Array<{ message: string }>;
    ref?: string;
    ref_type?: string;
    action?: string;
  };
}

interface GitHubRepo {
  id: number;
  name: string;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const USERNAME = 'sa1701';
const EVENTS_URL = `https://api.github.com/users/${USERNAME}/events?per_page=5`;
const REPOS_URL = `https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=4`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface EventDisplay {
  icon: string;
  description: string;
}

function describeEvent(event: GitHubEvent): EventDisplay {
  const repo = event.repo.name.replace(`${USERNAME}/`, '');
  switch (event.type) {
    case 'PushEvent': {
      const commits = event.payload.commits ?? [];
      const msg = commits[0]?.message?.split('\n')[0] ?? 'code';
      return { icon: '⬆', description: `Pushed "${msg}" to ${repo}` };
    }
    case 'CreateEvent':
      return {
        icon: '✦',
        description: `Created ${event.payload.ref_type} ${event.payload.ref ?? ''} in ${repo}`,
      };
    case 'DeleteEvent':
      return { icon: '✕', description: `Deleted ${event.payload.ref_type} in ${repo}` };
    case 'WatchEvent':
      return { icon: '★', description: `Starred ${repo}` };
    case 'ForkEvent':
      return { icon: '⑂', description: `Forked ${repo}` };
    case 'IssuesEvent':
      return { icon: '●', description: `${event.payload.action} issue in ${repo}` };
    case 'PullRequestEvent':
      return { icon: '⇄', description: `${event.payload.action} PR in ${repo}` };
    default:
      return { icon: '○', description: `${event.type.replace('Event', '')} in ${repo}` };
  }
}

// ---------------------------------------------------------------------------
// GitHubActivity Widget
// ---------------------------------------------------------------------------

export default function GitHubActivity() {
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsRes, reposRes] = await Promise.all([
        fetch(EVENTS_URL, { cache: 'no-store' }),
        fetch(REPOS_URL, { cache: 'no-store' }),
      ]);

      if (!eventsRes.ok && eventsRes.status !== 304) {
        if (eventsRes.status === 403) throw new Error('GitHub API rate limit reached');
        throw new Error(`Events fetch failed: HTTP ${eventsRes.status}`);
      }
      if (!reposRes.ok && reposRes.status !== 304) {
        throw new Error(`Repos fetch failed: HTTP ${reposRes.status}`);
      }

      const eventsData: GitHubEvent[] = eventsRes.ok ? await eventsRes.json() : [];
      const reposData: GitHubRepo[] = reposRes.ok ? await reposRes.json() : [];

      setEvents(eventsData.slice(0, 5));
      setRepos(reposData.slice(0, 4));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GitHub data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Refresh every 5 minutes
    const id = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchData]);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ color: 'var(--text)' }}
            aria-hidden
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            {USERNAME}
          </span>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70 disabled:opacity-40"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Refresh GitHub activity"
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
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div
          className="text-xs px-3 py-2 rounded border shrink-0"
          style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Recent activity */}
      {!error && (
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
          {loading && events.length === 0
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 rounded animate-pulse"
                  style={{ background: 'var(--card-border)' }}
                />
              ))
            : events.length === 0
            ? (
              <p className="text-xs py-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                No recent events found.
              </p>
            )
            : events.map((event) => {
                const { icon, description } = describeEvent(event);
                let timeAgo = '';
                try {
                  timeAgo = formatDistanceToNow(new Date(event.created_at), { addSuffix: true });
                } catch {
                  timeAgo = event.created_at;
                }

                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-2 text-xs"
                    aria-label={`${description}, ${timeAgo}`}
                  >
                    <span
                      className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--accent)' }}
                      aria-hidden
                    >
                      {icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="leading-snug line-clamp-2"
                        style={{ color: 'var(--text)' }}
                      >
                        {description}
                      </p>
                      <p className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {timeAgo}
                      </p>
                    </div>
                  </div>
                );
              })}
        </div>
      )}

      {/* Repo mini-grid */}
      {repos.length > 0 && (
        <div
          className="border-t pt-3 shrink-0"
          style={{ borderColor: 'var(--card-border)' }}
          aria-label="Recent repositories"
        >
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Recent Repos
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {repos.map((repo) => (
              <a
                key={repo.id}
                href={`https://github.com/${USERNAME}/${repo.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded border text-xs transition-opacity hover:opacity-80 min-w-0"
                style={{ borderColor: 'var(--card-border)', background: 'var(--bg-secondary)' }}
                aria-label={`${repo.name}: ${repo.stargazers_count} stars`}
              >
                <span
                  className="shrink-0 w-2 h-2 rounded-full"
                  style={{ background: 'var(--accent)' }}
                  aria-hidden
                />
                <span className="truncate font-medium" style={{ color: 'var(--text)' }}>
                  {repo.name}
                </span>
                {repo.stargazers_count > 0 && (
                  <span className="ml-auto shrink-0" style={{ color: 'var(--text-secondary)' }}>
                    ★{repo.stargazers_count}
                  </span>
                )}
              </a>
            ))}
          </div>
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
