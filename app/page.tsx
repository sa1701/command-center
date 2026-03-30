import DashboardGrid from '@/components/layout/DashboardGrid';
import WidgetWrapper from '@/components/layout/WidgetWrapper';
import ThemeSelector from '@/components/layout/ThemeSelector';
import Clock from '@/components/widgets/Clock';
import TodoList from '@/components/widgets/TodoList';
import PomodoroTimer from '@/components/widgets/PomodoroTimer';
import Calendar from '@/components/widgets/Calendar';
import HabitTracker from '@/components/widgets/HabitTracker';
import QuickNotes from '@/components/widgets/QuickNotes';
import Weather from '@/components/widgets/Weather';
import GitHubActivity from '@/components/widgets/GitHubActivity';
import GradeTracker from '@/components/widgets/GradeTracker';
import Bookmarks from '@/components/widgets/Bookmarks';

export default function HomePage() {
  return (
    <div
      className="min-h-screen theme-transition"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3 border-b theme-transition"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--card-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse-glow"
            style={{ backgroundColor: 'var(--accent)' }}
            aria-hidden="true"
          />
          <h1
            className="text-lg md:text-xl font-bold tracking-widest uppercase glow-accent"
            style={{ color: 'var(--accent)' }}
          >
            Command Center
          </h1>
        </div>
        <ThemeSelector />
      </header>

      <DashboardGrid>
        <WidgetWrapper title="Clock" className="col-span-1 sm:col-span-2" collapsible={false}>
          <Clock />
        </WidgetWrapper>

        <WidgetWrapper title="Todo List" className="col-span-1" collapsible>
          <TodoList />
        </WidgetWrapper>

        <WidgetWrapper title="Pomodoro Timer" className="col-span-1" collapsible>
          <PomodoroTimer />
        </WidgetWrapper>

        <WidgetWrapper title="Calendar" className="col-span-1 md:col-span-2" collapsible>
          <Calendar />
        </WidgetWrapper>

        <WidgetWrapper title="Habit Tracker" className="col-span-1 md:col-span-2" collapsible>
          <HabitTracker />
        </WidgetWrapper>

        <WidgetWrapper title="Quick Notes" className="col-span-1" collapsible>
          <QuickNotes />
        </WidgetWrapper>

        <WidgetWrapper title="Weather" className="col-span-1" collapsible={false}>
          <Weather />
        </WidgetWrapper>

        <WidgetWrapper title="GitHub Activity" className="col-span-1 sm:col-span-2" collapsible>
          <GitHubActivity />
        </WidgetWrapper>

        <WidgetWrapper title="Grade Tracker" className="col-span-1 md:col-span-2" collapsible>
          <GradeTracker />
        </WidgetWrapper>

        <WidgetWrapper title="Bookmarks" className="col-span-1" collapsible>
          <Bookmarks />
        </WidgetWrapper>
      </DashboardGrid>
    </div>
  );
}
