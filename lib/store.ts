import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// Theme slice
// ---------------------------------------------------------------------------

interface ThemeSlice {
  themeId: string;
  setTheme: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Root store
// Structured so widget slices (todos, habits, pomodoro, etc.) can be merged
// in by other agents without touching the core theme logic.
// ---------------------------------------------------------------------------

type DashboardStore = ThemeSlice;
// Future slices will extend this type:
//   & TodoSlice & HabitSlice & PomodoroSlice & ...

const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      // --- Theme ---
      themeId: 'ot-raimi',
      setTheme: (id: string) => set({ themeId: id }),

      // --- Widget stores will be added here ---
      // e.g. todos: [], addTodo: () => {}, ...
    }),
    {
      name: 'command-center-store',
    }
  )
);

export default useDashboardStore;
