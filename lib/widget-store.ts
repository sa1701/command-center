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
  dueDate?: string;
}

interface TodoState {
  todos: Todo[];
  addTodo: (text: string, priority: Priority, dueDate?: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (todos: Todo[]) => void;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      todos: [
        { id: uid(), text: 'PHYS295 — Virtual Sunspot Lab', completed: false, priority: 'high' as Priority, createdAt: Date.now(), dueDate: '2026-04-02' },
        { id: uid(), text: 'CSIT321 — A1: Initial Project Description', completed: false, priority: 'high' as Priority, createdAt: Date.now(), dueDate: '2026-04-03' },
        { id: uid(), text: 'PHYS295 — Engagement Quiz Week 5', completed: false, priority: 'medium' as Priority, createdAt: Date.now(), dueDate: '2026-04-09' },
        { id: uid(), text: 'PHYS295 — Mars Explorer Assignment', completed: false, priority: 'high' as Priority, createdAt: Date.now(), dueDate: '2026-04-17' },
        { id: uid(), text: 'CSIT314 — 1st Progress Report', completed: false, priority: 'high' as Priority, createdAt: Date.now(), dueDate: '2026-04-17' },
        { id: uid(), text: 'CSCI316 — Individual Assignment', completed: false, priority: 'high' as Priority, createdAt: Date.now(), dueDate: '2026-04-19' },
      ],
      addTodo: (text, priority, dueDate) =>
        set((s) => ({
          todos: [
            ...s.todos,
            { id: uid(), text, completed: false, priority, createdAt: Date.now(), ...(dueDate ? { dueDate } : {}) },
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
  isMuted: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  switchMode: (isBreak: boolean) => void;
  setWorkDuration: (seconds: number) => void;
  setBreakDuration: (seconds: number) => void;
  toggleMute: () => void;
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
      isMuted: false,
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
      setWorkDuration: (seconds) => {
        const { isRunning, isBreak } = get();
        set({ workDuration: seconds, ...(!isRunning && !isBreak ? { timeLeft: seconds } : {}) });
      },
      setBreakDuration: (seconds) => {
        const { isRunning, isBreak } = get();
        set({ breakDuration: seconds, ...(!isRunning && isBreak ? { timeLeft: seconds } : {}) });
      },
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
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
        { id: uid(), subject: 'CSIT205 — IT Project Mgmt', grade: 79, credits: 6 },
        { id: uid(), subject: 'CSIT214 — System Analysis', grade: 75, credits: 6 },
        { id: uid(), subject: 'CSCI218 — Algorithms', grade: 67, credits: 6 },
        { id: uid(), subject: 'CSIT127 — Network Fundamentals', grade: 66, credits: 6 },
        { id: uid(), subject: 'CSIT226 — Information Systems', grade: 66, credits: 6 },
        { id: uid(), subject: 'CSCI323 — Algorithm Design', grade: 50, credits: 6 },
        { id: uid(), subject: 'CSCI316 — Big Data Mining', grade: 36, credits: 6 },
        { id: uid(), subject: 'ISIT312 — Info Systems Analysis', grade: 17, credits: 6 },
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
    { name: 'widget-grades-v2' }
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
        { id: uid(), name: 'Moodle', url: 'https://moodle.uowplatform.edu.au', category: 'Uni' },
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
  updateEvent: (id: string, text: string) => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      events: [
        { id: uid(), date: '2026-04-02', text: 'PHYS295 — Virtual Sunspot Lab due' },
        { id: uid(), date: '2026-04-03', text: 'CSIT321 — A1: Initial Project Description due (11PM)' },
        { id: uid(), date: '2026-04-09', text: 'PHYS295 — Engagement Quiz Week 5 closes' },
        { id: uid(), date: '2026-04-17', text: 'PHYS295 — Mars Explorer due' },
        { id: uid(), date: '2026-04-17', text: 'CSIT314 — 1st Progress Report due' },
        { id: uid(), date: '2026-04-19', text: 'CSCI316 — Individual Assignment due (11:30PM)' },
        { id: uid(), date: '2026-05-01', text: 'PHYS295 — Engagement Quiz Week 8 closes' },
        { id: uid(), date: '2026-05-03', text: 'PHYS295 — Mid-session Exam Prep Quiz closes' },
        { id: uid(), date: '2026-05-15', text: 'PHYS295 — Spectral Classification Quiz closes' },
        { id: uid(), date: '2026-05-15', text: 'PHYS295 — Engagement Quiz Week 10 closes' },
        { id: uid(), date: '2026-05-22', text: 'PHYS295 — Engagement Quiz Week 9 closes' },
        { id: uid(), date: '2026-05-29', text: 'PHYS295 — Engagement Quiz Week 12 closes' },
        { id: uid(), date: '2026-06-05', text: 'PHYS295 — Galaxy Classification Quiz closes' },
        { id: uid(), date: '2026-06-14', text: 'PHYS295 — Final Exam Prep Quiz closes' },
      ],
      addEvent: (date, text) =>
        set((s) => ({
          events: [...s.events, { id: uid(), date, text }],
        })),
      removeEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
      updateEvent: (id, text) =>
        set((s) => ({ events: s.events.map((e) => e.id === id ? { ...e, text } : e) })),
    }),
    { name: 'widget-calendar' }
  )
);

// ---------------------------------------------------------------------------
// Timetable Store
// ---------------------------------------------------------------------------

export interface TimetableClass {
  subject: string;
  type: string;
  location: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  weeks: number[] | 'all';
  color: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

const TIMETABLE_DATA: Record<DayOfWeek, TimetableClass[]> = {
  Monday: [
    { subject: 'PHYS295', type: 'Tutorial', location: 'Lecture Online', startTime: '11:30', endTime: '12:30', weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13], color: '#e74c3c' },
  ],
  Tuesday: [
    { subject: 'CSIT321', type: 'Lecture', location: '20-1', startTime: '12:30', endTime: '14:30', weeks: [1,2,3,14,21,24], color: '#3498db' },
    { subject: 'CSCI316', type: 'Lecture A', location: '20-4', startTime: '14:30', endTime: '16:30', weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13], color: '#2ecc71' },
    { subject: 'CSCI316', type: 'Computer Lab', location: '3-126', startTime: '16:30', endTime: '18:30', weeks: [3,5,7,9,11], color: '#2ecc71' },
  ],
  Wednesday: [
    { subject: 'CSIT314', type: 'Lecture', location: '67-107', startTime: '10:30', endTime: '12:30', weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13], color: '#9b59b6' },
    { subject: 'CSIT321', type: 'Workshop', location: 'Class Online', startTime: '13:30', endTime: '15:30', weeks: [5,7,12,15,22,26], color: '#3498db' },
    { subject: 'CSCI316', type: 'Lecture B', location: '20-4', startTime: '15:30', endTime: '16:30', weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13], color: '#2ecc71' },
  ],
  Thursday: [
    { subject: 'CSIT314', type: 'Computer Lab', location: '3-127', startTime: '10:30', endTime: '12:30', weeks: [3,5,7,9,11], color: '#9b59b6' },
  ],
  Friday: [
    { subject: 'PHYS295', type: 'Practical B', location: '6-316', startTime: '11:30', endTime: '13:30', weeks: [6], color: '#e74c3c' },
  ],
};

// Session start: 2026-02-23 (Monday of Week 1)
const SESSION_START = new Date(2026, 1, 23);

interface TimetableState {
  schedule: Record<DayOfWeek, TimetableClass[]>;
  sessionStart: string;
  getCurrentWeek: () => number;
  getTodayClasses: () => TimetableClass[];
  getDayClasses: (day: DayOfWeek, week?: number) => TimetableClass[];
}

export const useTimetableStore = create<TimetableState>()(() => ({
  schedule: TIMETABLE_DATA,
  sessionStart: SESSION_START.toISOString(),
  getCurrentWeek: () => {
    const now = new Date();
    const diff = now.getTime() - SESSION_START.getTime();
    return Math.max(1, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)));
  },
  getTodayClasses: () => {
    const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayIdx = new Date().getDay();
    if (dayIdx === 0 || dayIdx === 6) return []; // weekend
    const day = days[dayIdx - 1];
    const now = new Date();
    const week = Math.max(1, Math.ceil((now.getTime() - SESSION_START.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    return TIMETABLE_DATA[day].filter(c => c.weeks === 'all' || c.weeks.includes(week));
  },
  getDayClasses: (day: DayOfWeek, week?: number) => {
    const w = week ?? Math.max(1, Math.ceil((new Date().getTime() - SESSION_START.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    return TIMETABLE_DATA[day].filter(c => c.weeks === 'all' || c.weeks.includes(w));
  },
}));

// ---------------------------------------------------------------------------
// Workout Store
// ---------------------------------------------------------------------------

export interface Exercise {
  name: string;
  setsTarget: number;
  repsTarget: string; // e.g., "6-8"
  muscle: string;
}

export interface LoggedSet {
  weight: number;
  reps: number;
}

export interface WorkoutLog {
  date: string; // YYYY-MM-DD
  workoutType: string;
  exercises: Record<string, LoggedSet[]>; // exercise name → sets
}

type WorkoutDay = 'Upper A' | 'Lower A' | 'Upper B' | 'Lower B';

const WORKOUT_EXERCISES: Record<WorkoutDay, Exercise[]> = {
  'Upper A': [
    { name: 'Barbell Bench Press', setsTarget: 2, repsTarget: '6-8', muscle: 'Chest' },
    { name: 'Incline DB Press', setsTarget: 2, repsTarget: '8-10', muscle: 'Upper Chest' },
    { name: 'Cable Fly (low-to-high)', setsTarget: 2, repsTarget: '12-15', muscle: 'Chest' },
    { name: 'Overhead Press', setsTarget: 2, repsTarget: '6-8', muscle: 'Shoulders' },
    { name: 'Cable Lateral Raise', setsTarget: 2, repsTarget: '12-15', muscle: 'Side Delts' },
    { name: 'Barbell Row', setsTarget: 2, repsTarget: '6-8', muscle: 'Back' },
    { name: 'Straight-Arm Pulldown', setsTarget: 2, repsTarget: '12-15', muscle: 'Lats' },
    { name: 'Cable Face Pull', setsTarget: 2, repsTarget: '15-20', muscle: 'Rear Delts' },
    { name: 'Tricep Pushdown', setsTarget: 2, repsTarget: '10-12', muscle: 'Triceps' },
  ],
  'Lower A': [
    { name: 'Barbell Squat', setsTarget: 2, repsTarget: '5-7', muscle: 'Quads' },
    { name: 'Leg Press', setsTarget: 2, repsTarget: '8-12', muscle: 'Quads' },
    { name: 'Leg Extension', setsTarget: 2, repsTarget: '12-15', muscle: 'Quads' },
    { name: 'Romanian Deadlift', setsTarget: 2, repsTarget: '8-10', muscle: 'Hamstrings' },
    { name: 'Leg Curl', setsTarget: 2, repsTarget: '10-12', muscle: 'Hamstrings' },
    { name: 'Standing Calf Raise', setsTarget: 2, repsTarget: '10-12', muscle: 'Calves' },
    { name: 'Seated Calf Raise', setsTarget: 2, repsTarget: '12-15', muscle: 'Calves' },
  ],
  'Upper B': [
    { name: 'Weighted Pull-ups', setsTarget: 2, repsTarget: '6-8', muscle: 'Lats' },
    { name: 'Cable Row (wide grip)', setsTarget: 2, repsTarget: '8-10', muscle: 'Back' },
    { name: 'Chest-Supported DB Row', setsTarget: 2, repsTarget: '10-12', muscle: 'Upper Back' },
    { name: 'DB Shoulder Press', setsTarget: 2, repsTarget: '8-10', muscle: 'Shoulders' },
    { name: 'Machine Lateral Raise', setsTarget: 2, repsTarget: '12-15', muscle: 'Side Delts' },
    { name: 'Dips (weighted)', setsTarget: 2, repsTarget: '6-8', muscle: 'Chest/Triceps' },
    { name: 'Flat DB Fly', setsTarget: 2, repsTarget: '10-12', muscle: 'Chest' },
    { name: 'Barbell Curl', setsTarget: 2, repsTarget: '8-10', muscle: 'Biceps' },
    { name: 'Rear Delt Fly (machine)', setsTarget: 2, repsTarget: '12-15', muscle: 'Rear Delts' },
  ],
  'Lower B': [
    { name: 'Deadlift (conventional)', setsTarget: 2, repsTarget: '4-6', muscle: 'Posterior Chain' },
    { name: 'Bulgarian Split Squat', setsTarget: 2, repsTarget: '8-10', muscle: 'Quads/Glutes' },
    { name: 'Hack Squat', setsTarget: 2, repsTarget: '10-12', muscle: 'Quads' },
    { name: 'Seated Leg Curl', setsTarget: 2, repsTarget: '10-12', muscle: 'Hamstrings' },
    { name: 'Hip Thrust', setsTarget: 2, repsTarget: '8-10', muscle: 'Glutes' },
    { name: 'Standing Calf Raise', setsTarget: 2, repsTarget: '10-12', muscle: 'Calves' },
    { name: 'Seated Calf Raise', setsTarget: 2, repsTarget: '12-15', muscle: 'Calves' },
  ],
};

// Mon=Upper A, Tue=Lower A, Wed=Rest, Thu=Upper B, Fri=Lower B, Sat/Sun=Rest
const WORKOUT_SCHEDULE: Record<number, WorkoutDay> = {
  1: 'Upper A', // Monday
  2: 'Lower A', // Tuesday
  4: 'Upper B', // Thursday
  5: 'Lower B', // Friday
};

interface WorkoutState {
  logs: WorkoutLog[];
  exercises: Record<WorkoutDay, Exercise[]>;
  schedule: Record<number, WorkoutDay>;
  getTodayWorkout: () => WorkoutDay | null;
  logSet: (date: string, workoutType: string, exerciseName: string, set: LoggedSet) => void;
  getLog: (date: string) => WorkoutLog | undefined;
  getExerciseHistory: (exerciseName: string, limit?: number) => { date: string; sets: LoggedSet[] }[];
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      logs: [],
      exercises: WORKOUT_EXERCISES,
      schedule: WORKOUT_SCHEDULE,
      getTodayWorkout: () => {
        const day = new Date().getDay(); // 0=Sun, 1=Mon...
        return WORKOUT_SCHEDULE[day] ?? null;
      },
      logSet: (date, workoutType, exerciseName, loggedSet) =>
        set((s) => {
          const existing = s.logs.find(l => l.date === date);
          if (existing) {
            const exSets = existing.exercises[exerciseName] || [];
            return {
              logs: s.logs.map(l =>
                l.date === date
                  ? { ...l, exercises: { ...l.exercises, [exerciseName]: [...exSets, loggedSet] } }
                  : l
              ),
            };
          }
          return {
            logs: [...s.logs, { date, workoutType, exercises: { [exerciseName]: [loggedSet] } }],
          };
        }),
      getLog: (date) => get().logs.find(l => l.date === date),
      getExerciseHistory: (exerciseName, limit = 8) => {
        return get()
          .logs
          .filter(l => l.exercises[exerciseName])
          .slice(-limit)
          .map(l => ({ date: l.date, sets: l.exercises[exerciseName] }));
      },
    }),
    { name: 'widget-workout' }
  )
);

// ---------------------------------------------------------------------------
// Project Progress Store
// ---------------------------------------------------------------------------

export type ProjectStatus = 'not_started' | 'in_progress' | 'complete';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number; // 0-100
  githubUrl?: string;
  techStack: string[];
}

interface ProjectState {
  projects: Project[];
  updateProject: (id: string, updates: Partial<Omit<Project, 'id'>>) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [
        { id: uid(), name: 'RAG PDF Chat', description: 'Retrieval-augmented PDF chat — LangChain, FAISS, Ollama', status: 'complete', progress: 100, githubUrl: 'https://github.com/sa1701/rag-pdf-chat', techStack: ['Python', 'LangChain', 'FAISS', 'Ollama'] },
        { id: uid(), name: 'TaskFlow', description: 'Full-stack task manager with auth and real-time DB', status: 'complete', progress: 100, githubUrl: 'https://github.com/sa1701/taskflow', techStack: ['Next.js', 'Supabase', 'Prisma', 'NextAuth'] },
        { id: uid(), name: 'ai-commit', description: 'AI-generated git commit messages via local LLM', status: 'complete', progress: 100, githubUrl: 'https://github.com/sa1701/ai-commit', techStack: ['Python', 'Click', 'Ollama'] },
        { id: uid(), name: 'Big Data ML', description: 'Decision tree + ensemble methods built from scratch', status: 'complete', progress: 100, githubUrl: 'https://github.com/sa1701/big-data-ml', techStack: ['Python', 'Jupyter', 'scikit-learn', 'Pandas'] },
      ],
      updateProject: (id, updates) =>
        set((s) => ({
          projects: s.projects.map(p => p.id === id ? { ...p, ...updates } : p),
        })),
    }),
    { name: 'widget-projects-v2' }
  )
);

// ---------------------------------------------------------------------------
// Prayer Times Store
// ---------------------------------------------------------------------------

export interface PrayerTime {
  name: string;
  time: string; // HH:MM
}

interface PrayerState {
  times: PrayerTime[];
  lastFetchDate: string | null;
  location: string;
  loading: boolean;
  error: string | null;
  setTimes: (times: PrayerTime[], date: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePrayerStore = create<PrayerState>()(
  persist(
    (set) => ({
      times: [],
      lastFetchDate: null,
      location: 'Sydney / Wollongong',
      loading: false,
      error: null,
      setTimes: (times, date) => set({ times, lastFetchDate: date, error: null }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error, loading: false }),
    }),
    { name: 'widget-prayer' }
  )
);

// ---------------------------------------------------------------------------
// Nutrition Tracker Store
// ---------------------------------------------------------------------------

interface NutritionEntry {
  date: string; // YYYY-MM-DD
  water: number; // glasses
  protein: number; // grams
  calories: number;
}

interface NutritionState {
  entries: NutritionEntry[];
  waterTarget: number;
  proteinTarget: number;
  calorieTarget: number;
  getToday: () => NutritionEntry;
  addWater: () => void;
  removeWater: () => void;
  setProtein: (grams: number) => void;
  setCalories: (cals: number) => void;
  setTargets: (water: number, protein: number, calories: number) => void;
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      entries: [],
      waterTarget: 8,
      proteinTarget: 150,
      calorieTarget: 2800,
      getToday: () => {
        const today = todayStr();
        return get().entries.find(e => e.date === today) ?? { date: today, water: 0, protein: 0, calories: 0 };
      },
      addWater: () =>
        set((s) => {
          const today = todayStr();
          const existing = s.entries.find(e => e.date === today);
          if (existing) {
            return { entries: s.entries.map(e => e.date === today ? { ...e, water: e.water + 1 } : e) };
          }
          return { entries: [...s.entries, { date: today, water: 1, protein: 0, calories: 0 }] };
        }),
      removeWater: () =>
        set((s) => {
          const today = todayStr();
          return {
            entries: s.entries.map(e =>
              e.date === today ? { ...e, water: Math.max(0, e.water - 1) } : e
            ),
          };
        }),
      setProtein: (grams) =>
        set((s) => {
          const today = todayStr();
          const existing = s.entries.find(e => e.date === today);
          if (existing) {
            return { entries: s.entries.map(e => e.date === today ? { ...e, protein: grams } : e) };
          }
          return { entries: [...s.entries, { date: today, water: 0, protein: grams, calories: 0 }] };
        }),
      setCalories: (cals) =>
        set((s) => {
          const today = todayStr();
          const existing = s.entries.find(e => e.date === today);
          if (existing) {
            return { entries: s.entries.map(e => e.date === today ? { ...e, calories: cals } : e) };
          }
          return { entries: [...s.entries, { date: today, water: 0, protein: 0, calories: cals }] };
        }),
      setTargets: (water, protein, calories) =>
        set({ waterTarget: water, proteinTarget: protein, calorieTarget: calories }),
    }),
    { name: 'widget-nutrition' }
  )
);

// ---------------------------------------------------------------------------
// Layout Store (widget order for drag-and-drop)
// ---------------------------------------------------------------------------

interface LayoutState {
  widgetOrder: string[];
  setWidgetOrder: (order: string[]) => void;
  resetLayout: () => void;
}

const DEFAULT_WIDGET_ORDER = [
  'Clock', 'Timetable', 'Todo List', 'Pomodoro Timer',
  'Workout Tracker', 'Prayer Times', 'Nutrition Tracker',
  'Calendar', 'Habit Tracker', 'Project Progress',
  'Grade Tracker', 'Weather', 'GitHub Activity',
  'Bookmarks', 'Quick Notes',
];

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      widgetOrder: DEFAULT_WIDGET_ORDER,
      setWidgetOrder: (order) => set({ widgetOrder: order }),
      resetLayout: () => set({ widgetOrder: DEFAULT_WIDGET_ORDER }),
    }),
    { name: 'widget-layout' }
  )
);
