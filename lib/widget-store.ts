import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ---------------------------------------------------------------------------
// Todo Store
// ---------------------------------------------------------------------------

export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
}

interface TodoState {
  todos: Todo[];
  addTodo: (text: string, priority: Priority) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (todos: Todo[]) => void;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      todos: [],
      addTodo: (text, priority) =>
        set((s) => ({
          todos: [
            ...s.todos,
            { id: uid(), text, completed: false, priority, createdAt: Date.now() },
          ],
        })),
      toggleTodo: (id) =>
        set((s) => ({
          todos: s.todos.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),
      deleteTodo: (id) =>
        set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),
      reorderTodos: (todos) => set({ todos }),
    }),
    { name: 'widget-todos' }
  )
);

// ---------------------------------------------------------------------------
// Pomodoro Store
// ---------------------------------------------------------------------------

interface PomodoroState {
  timeLeft: number;
  isRunning: boolean;
  isBreak: boolean;
  sessions: number;
  workDuration: number;
  breakDuration: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  switchMode: (isBreak: boolean) => void;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      timeLeft: 1500,
      isRunning: false,
      isBreak: false,
      sessions: 0,
      workDuration: 1500,
      breakDuration: 300,
      start: () => set({ isRunning: true }),
      pause: () => set({ isRunning: false }),
      reset: () => {
        const { isBreak, workDuration, breakDuration } = get();
        set({ isRunning: false, timeLeft: isBreak ? breakDuration : workDuration });
      },
      tick: () => {
        const { timeLeft, isBreak, sessions, workDuration, breakDuration } = get();
        if (timeLeft > 0) {
          set({ timeLeft: timeLeft - 1 });
        } else {
          const nextIsBreak = !isBreak;
          set({
            isRunning: false,
            isBreak: nextIsBreak,
            sessions: nextIsBreak ? sessions + 1 : sessions,
            timeLeft: nextIsBreak ? breakDuration : workDuration,
          });
        }
      },
      switchMode: (isBreak) => {
        const { workDuration, breakDuration } = get();
        set({ isBreak, isRunning: false, timeLeft: isBreak ? breakDuration : workDuration });
      },
    }),
    { name: 'widget-pomodoro' }
  )
);

// ---------------------------------------------------------------------------
// Habit Store
// ---------------------------------------------------------------------------

export interface Habit {
  id: string;
  name: string;
  completedDates: string[];
}

interface HabitState {
  habits: Habit[];
  addHabit: (name: string) => void;
  toggleHabitDate: (habitId: string, date: string) => void;
  deleteHabit: (id: string) => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      habits: [],
      addHabit: (name) =>
        set((s) => ({
          habits: [...s.habits, { id: uid(), name, completedDates: [] }],
        })),
      toggleHabitDate: (habitId, date) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== habitId) return h;
            const has = h.completedDates.includes(date);
            return {
              ...h,
              completedDates: has
                ? h.completedDates.filter((d) => d !== date)
                : [...h.completedDates, date],
            };
          }),
        })),
      deleteHabit: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
    }),
    { name: 'widget-habits' }
  )
);

// ---------------------------------------------------------------------------
// Notes Store
// ---------------------------------------------------------------------------

interface NotesState {
  content: string;
  setContent: (content: string) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      content: '',
      setContent: (content) => set({ content }),
    }),
    { name: 'widget-notes' }
  )
);

// ---------------------------------------------------------------------------
// Grade Store
// ---------------------------------------------------------------------------

export interface Grade {
  id: string;
  subject: string;
  grade: number;
  credits: number;
}

interface GradeState {
  grades: Grade[];
  addGrade: (subject: string, grade: number, credits: number) => void;
  removeGrade: (id: string) => void;
  updateGrade: (id: string, updates: Partial<Omit<Grade, 'id'>>) => void;
}

export const useGradeStore = create<GradeState>()(
  persist(
    (set) => ({
      grades: [
        { id: uid(), subject: 'System Analysis', grade: 85, credits: 6 },
        { id: uid(), subject: 'Generative AI', grade: 79, credits: 6 },
        { id: uid(), subject: 'Python Programming', grade: 78, credits: 6 },
        { id: uid(), subject: 'Cyber Security', grade: 77, credits: 6 },
        { id: uid(), subject: 'IT Project Management', grade: 75, credits: 6 },
      ],
      addGrade: (subject, grade, credits) =>
        set((s) => ({
          grades: [...s.grades, { id: uid(), subject, grade, credits }],
        })),
      removeGrade: (id) => set((s) => ({ grades: s.grades.filter((g) => g.id !== id) })),
      updateGrade: (id, updates) =>
        set((s) => ({
          grades: s.grades.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),
    }),
    { name: 'widget-grades' }
  )
);

// ---------------------------------------------------------------------------
// Bookmark Store
// ---------------------------------------------------------------------------

export interface Bookmark {
  id: string;
  name: string;
  url: string;
  category: string;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  addBookmark: (name: string, url: string, category: string) => void;
  removeBookmark: (id: string) => void;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set) => ({
      bookmarks: [
        { id: uid(), name: 'GitHub', url: 'https://github.com', category: 'Dev' },
        { id: uid(), name: 'Stack Overflow', url: 'https://stackoverflow.com', category: 'Dev' },
        { id: uid(), name: 'MDN Docs', url: 'https://developer.mozilla.org', category: 'Dev' },
        { id: uid(), name: 'ChatGPT', url: 'https://chat.openai.com', category: 'AI' },
        { id: uid(), name: 'Claude', url: 'https://claude.ai', category: 'AI' },
      ],
      addBookmark: (name, url, category) =>
        set((s) => ({
          bookmarks: [...s.bookmarks, { id: uid(), name, url, category }],
        })),
      removeBookmark: (id) =>
        set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),
    }),
    { name: 'widget-bookmarks' }
  )
);

// ---------------------------------------------------------------------------
// Calendar Store
// ---------------------------------------------------------------------------

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
}

interface CalendarState {
  events: CalendarEvent[];
  addEvent: (date: string, text: string) => void;
  removeEvent: (id: string) => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      events: [],
      addEvent: (date, text) =>
        set((s) => ({
          events: [...s.events, { id: uid(), date, text }],
        })),
      removeEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
    }),
    { name: 'widget-calendar' }
  )
);
