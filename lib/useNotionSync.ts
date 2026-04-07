'use client';

import { useState, useCallback, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'disconnected';

interface NotionTodo {
  id: string;
  text: string;
  done: boolean;
  priority?: string;
  dueDate?: string;
  area?: string;
}

interface NotionProject {
  id: string;
  name: string;
  status: string;
  description: string;
  githubUrl: string;
  languages: string[];
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export default function useNotionSync() {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);

  // Check connection on mount
  useEffect(() => {
    fetch('/api/notion?type=status')
      .then((r) => r.json())
      .then((d) => setConnected(d.connected ?? false))
      .catch(() => setConnected(false));
  }, []);

  // Pull todos from Notion
  const pullTodos = useCallback(async (): Promise<NotionTodo[]> => {
    const res = await fetch('/api/notion?type=todos');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.todos;
  }, []);

  // Pull projects from Notion
  const pullProjects = useCallback(async (): Promise<NotionProject[]> => {
    const res = await fetch('/api/notion?type=projects');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.projects;
  }, []);

  // Push a new todo to Notion
  const pushTodo = useCallback(async (text: string, done: boolean) => {
    const res = await fetch('/api/notion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'push-todo', text, done }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.id;
  }, []);

  // Push workout log to Notion
  const pushWorkout = useCallback(async (date: string, workoutType: string, exercises: string) => {
    const res = await fetch('/api/notion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'push-workout', date, workoutType, exercises }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.id;
  }, []);

  // Full sync: pull todos + projects, return merged data
  const syncAll = useCallback(async () => {
    setStatus('syncing');
    try {
      const [todos, projects] = await Promise.all([pullTodos(), pullProjects()]);
      setStatus('success');
      setLastSync(new Date().toLocaleTimeString());
      // Auto-reset status after 3s
      setTimeout(() => setStatus('idle'), 3000);
      return { todos, projects };
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
      return null;
    }
  }, [pullTodos, pullProjects]);

  return {
    status,
    connected,
    lastSync,
    syncAll,
    pullTodos,
    pullProjects,
    pushTodo,
    pushWorkout,
  };
}
