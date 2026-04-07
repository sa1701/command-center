import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import {
  useTodoStore,
  usePomodoroStore,
  useWorkoutStore,
  useProjectStore,
  useNutritionStore,
  usePrayerStore,
} from '@/lib/widget-store';

// ---------------------------------------------------------------------------
// Reset stores between tests (clear persisted state)
// ---------------------------------------------------------------------------

function resetStore(store: { setState: (s: any) => void; getInitialState: () => any }) {
  store.setState(store.getInitialState());
}

// ---------------------------------------------------------------------------
// Todo Store
// ---------------------------------------------------------------------------

describe('useTodoStore', () => {
  beforeEach(() => resetStore(useTodoStore));

  it('starts with default todos', () => {
    const { todos } = useTodoStore.getState();
    expect(todos.length).toBeGreaterThan(0);
    expect(todos[0]).toHaveProperty('text');
    expect(todos[0]).toHaveProperty('completed');
    expect(todos[0]).toHaveProperty('priority');
  });

  it('addTodo creates a new todo', () => {
    const before = useTodoStore.getState().todos.length;
    act(() => useTodoStore.getState().addTodo('Test task', 'high', '2026-05-01'));
    const { todos } = useTodoStore.getState();
    expect(todos.length).toBe(before + 1);
    const added = todos[todos.length - 1];
    expect(added.text).toBe('Test task');
    expect(added.priority).toBe('high');
    expect(added.completed).toBe(false);
    expect(added.dueDate).toBe('2026-05-01');
  });

  it('toggleTodo flips completed state', () => {
    const { todos } = useTodoStore.getState();
    const target = todos[0];
    expect(target.completed).toBe(false);

    act(() => useTodoStore.getState().toggleTodo(target.id));
    expect(useTodoStore.getState().todos[0].completed).toBe(true);

    act(() => useTodoStore.getState().toggleTodo(target.id));
    expect(useTodoStore.getState().todos[0].completed).toBe(false);
  });

  it('deleteTodo removes a todo', () => {
    const { todos } = useTodoStore.getState();
    const target = todos[0];
    const before = todos.length;

    act(() => useTodoStore.getState().deleteTodo(target.id));
    const after = useTodoStore.getState().todos;
    expect(after.length).toBe(before - 1);
    expect(after.find(t => t.id === target.id)).toBeUndefined();
  });

  it('reorderTodos replaces the array', () => {
    const { todos } = useTodoStore.getState();
    const reversed = [...todos].reverse();
    act(() => useTodoStore.getState().reorderTodos(reversed));
    expect(useTodoStore.getState().todos[0].id).toBe(reversed[0].id);
  });
});

// ---------------------------------------------------------------------------
// Pomodoro Store
// ---------------------------------------------------------------------------

describe('usePomodoroStore', () => {
  beforeEach(() => resetStore(usePomodoroStore));

  it('starts paused at 25 minutes', () => {
    const s = usePomodoroStore.getState();
    expect(s.isRunning).toBe(false);
    expect(s.timeLeft).toBe(1500);
    expect(s.isBreak).toBe(false);
  });

  it('start/pause controls isRunning', () => {
    act(() => usePomodoroStore.getState().start());
    expect(usePomodoroStore.getState().isRunning).toBe(true);

    act(() => usePomodoroStore.getState().pause());
    expect(usePomodoroStore.getState().isRunning).toBe(false);
  });

  it('tick decrements timeLeft', () => {
    act(() => usePomodoroStore.getState().start());
    act(() => usePomodoroStore.getState().tick());
    expect(usePomodoroStore.getState().timeLeft).toBe(1499);
  });

  it('tick at 0 switches to break mode', () => {
    act(() => usePomodoroStore.setState({ timeLeft: 0, isRunning: true }));
    act(() => usePomodoroStore.getState().tick());

    const s = usePomodoroStore.getState();
    expect(s.isBreak).toBe(true);
    expect(s.isRunning).toBe(false);
    expect(s.sessions).toBe(1);
    expect(s.timeLeft).toBe(300); // break duration
  });

  it('reset restores timeLeft for current mode', () => {
    act(() => {
      usePomodoroStore.getState().start();
      usePomodoroStore.getState().tick();
      usePomodoroStore.getState().tick();
    });
    expect(usePomodoroStore.getState().timeLeft).toBe(1498);

    act(() => usePomodoroStore.getState().reset());
    const s = usePomodoroStore.getState();
    expect(s.timeLeft).toBe(1500);
    expect(s.isRunning).toBe(false);
  });

  it('setWorkDuration updates both duration and timeLeft when idle', () => {
    act(() => usePomodoroStore.getState().setWorkDuration(3000));
    const s = usePomodoroStore.getState();
    expect(s.workDuration).toBe(3000);
    expect(s.timeLeft).toBe(3000);
  });
});

// ---------------------------------------------------------------------------
// Workout Store
// ---------------------------------------------------------------------------

describe('useWorkoutStore', () => {
  beforeEach(() => resetStore(useWorkoutStore));

  it('has exercises for all 4 workout days', () => {
    const { exercises } = useWorkoutStore.getState();
    expect(Object.keys(exercises)).toEqual(['Upper A', 'Lower A', 'Upper B', 'Lower B']);
    expect(exercises['Upper A'].length).toBeGreaterThan(0);
  });

  it('logSet creates a new log entry', () => {
    act(() => useWorkoutStore.getState().logSet('2026-04-08', 'Upper A', 'Barbell Bench Press', { weight: 80, reps: 6 }));
    const log = useWorkoutStore.getState().getLog('2026-04-08');
    expect(log).toBeDefined();
    expect(log!.workoutType).toBe('Upper A');
    expect(log!.exercises['Barbell Bench Press']).toEqual([{ weight: 80, reps: 6 }]);
  });

  it('logSet appends to existing log', () => {
    act(() => {
      useWorkoutStore.getState().logSet('2026-04-08', 'Upper A', 'Barbell Bench Press', { weight: 80, reps: 6 });
      useWorkoutStore.getState().logSet('2026-04-08', 'Upper A', 'Barbell Bench Press', { weight: 82.5, reps: 5 });
    });
    const log = useWorkoutStore.getState().getLog('2026-04-08');
    expect(log!.exercises['Barbell Bench Press']).toHaveLength(2);
    expect(log!.exercises['Barbell Bench Press'][1].weight).toBe(82.5);
  });

  it('getExerciseHistory returns entries for a specific exercise', () => {
    act(() => {
      useWorkoutStore.getState().logSet('2026-04-01', 'Upper A', 'Barbell Bench Press', { weight: 75, reps: 8 });
      useWorkoutStore.getState().logSet('2026-04-08', 'Upper A', 'Barbell Bench Press', { weight: 80, reps: 6 });
    });
    const history = useWorkoutStore.getState().getExerciseHistory('Barbell Bench Press', 4);
    expect(history).toHaveLength(2);
    expect(history[0].date).toBe('2026-04-01');
    expect(history[1].date).toBe('2026-04-08');
  });

  it('getLog returns undefined for missing date', () => {
    expect(useWorkoutStore.getState().getLog('1999-01-01')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Project Store
// ---------------------------------------------------------------------------

describe('useProjectStore', () => {
  beforeEach(() => resetStore(useProjectStore));

  it('starts with 4 projects', () => {
    const { projects } = useProjectStore.getState();
    expect(projects).toHaveLength(4);
    expect(projects.every(p => p.status === 'not_started')).toBe(true);
  });

  it('updateProject changes status and progress', () => {
    const { projects } = useProjectStore.getState();
    const id = projects[0].id;

    act(() => useProjectStore.getState().updateProject(id, { status: 'in_progress', progress: 50 }));
    const updated = useProjectStore.getState().projects.find(p => p.id === id)!;
    expect(updated.status).toBe('in_progress');
    expect(updated.progress).toBe(50);
  });

  it('updateProject does not affect other projects', () => {
    const { projects } = useProjectStore.getState();
    const id = projects[0].id;

    act(() => useProjectStore.getState().updateProject(id, { status: 'complete' }));
    const others = useProjectStore.getState().projects.filter(p => p.id !== id);
    expect(others.every(p => p.status === 'not_started')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Nutrition Store
// ---------------------------------------------------------------------------

describe('useNutritionStore', () => {
  beforeEach(() => resetStore(useNutritionStore));

  it('getToday returns zeroed entry for new day', () => {
    const today = useNutritionStore.getState().getToday();
    expect(today.water).toBe(0);
    expect(today.protein).toBe(0);
    expect(today.calories).toBe(0);
  });

  it('addWater increments water count', () => {
    act(() => useNutritionStore.getState().addWater());
    act(() => useNutritionStore.getState().addWater());
    expect(useNutritionStore.getState().getToday().water).toBe(2);
  });

  it('removeWater decrements but not below 0', () => {
    act(() => useNutritionStore.getState().addWater());
    act(() => useNutritionStore.getState().removeWater());
    expect(useNutritionStore.getState().getToday().water).toBe(0);

    act(() => useNutritionStore.getState().removeWater());
    expect(useNutritionStore.getState().getToday().water).toBe(0);
  });

  it('setProtein and setCalories update today entry', () => {
    act(() => useNutritionStore.getState().setProtein(120));
    act(() => useNutritionStore.getState().setCalories(2500));

    const today = useNutritionStore.getState().getToday();
    expect(today.protein).toBe(120);
    expect(today.calories).toBe(2500);
  });

  it('setTargets updates all three targets', () => {
    act(() => useNutritionStore.getState().setTargets(10, 200, 3000));
    const s = useNutritionStore.getState();
    expect(s.waterTarget).toBe(10);
    expect(s.proteinTarget).toBe(200);
    expect(s.calorieTarget).toBe(3000);
  });
});

// ---------------------------------------------------------------------------
// Prayer Store
// ---------------------------------------------------------------------------

describe('usePrayerStore', () => {
  beforeEach(() => resetStore(usePrayerStore));

  it('starts with empty times', () => {
    const s = usePrayerStore.getState();
    expect(s.times).toEqual([]);
    expect(s.lastFetchDate).toBeNull();
    expect(s.location).toBe('Sydney / Wollongong');
  });

  it('setTimes stores prayer times and date', () => {
    const times = [
      { name: 'Fajr', time: '05:12' },
      { name: 'Dhuhr', time: '12:05' },
    ];
    act(() => usePrayerStore.getState().setTimes(times, '2026-04-08'));

    const s = usePrayerStore.getState();
    expect(s.times).toEqual(times);
    expect(s.lastFetchDate).toBe('2026-04-08');
    expect(s.error).toBeNull();
  });

  it('setError clears loading and sets error', () => {
    act(() => usePrayerStore.getState().setLoading(true));
    expect(usePrayerStore.getState().loading).toBe(true);

    act(() => usePrayerStore.getState().setError('Network error'));
    const s = usePrayerStore.getState();
    expect(s.error).toBe('Network error');
    expect(s.loading).toBe(false);
  });
});
