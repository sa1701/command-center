'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { isToday, isPast, isTomorrow, parseISO, format } from 'date-fns';
import { useTodoStore, type Todo, type Priority } from '@/lib/widget-store';

// ---------------------------------------------------------------------------
// Priority config
// ---------------------------------------------------------------------------

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  high:   { label: 'High',   color: 'var(--danger)' },
  medium: { label: 'Med',    color: '#f59e0b' },
  low:    { label: 'Low',    color: '#22c55e' },
};

// ---------------------------------------------------------------------------
// SortableItem
// ---------------------------------------------------------------------------

function SortableItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: todo.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const pc = PRIORITY_CONFIG[todo.priority];

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 py-2 px-1 rounded group"
      aria-label={`Todo: ${todo.text}, priority ${pc.label}, ${todo.completed ? 'completed' : 'active'}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="opacity-30 group-hover:opacity-70 cursor-grab active:cursor-grabbing shrink-0 touch-none"
        style={{ color: 'var(--text-secondary)' }}
        aria-label="Drag to reorder"
        tabIndex={-1}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
          <circle cx="4" cy="3" r="1.2" />
          <circle cx="10" cy="3" r="1.2" />
          <circle cx="4" cy="7" r="1.2" />
          <circle cx="10" cy="7" r="1.2" />
          <circle cx="4" cy="11" r="1.2" />
          <circle cx="10" cy="11" r="1.2" />
        </svg>
      </button>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="shrink-0 w-4 h-4 cursor-pointer rounded"
        style={{ accentColor: 'var(--accent)' }}
        aria-checked={todo.completed}
      />

      {/* Priority dot */}
      <span
        className="shrink-0 w-2 h-2 rounded-full"
        style={{ backgroundColor: pc.color }}
        aria-label={`${pc.label} priority`}
        title={`${pc.label} priority`}
      />

      {/* Text */}
      <span
        className="flex-1 text-sm truncate"
        style={{
          color: todo.completed ? 'var(--text-secondary)' : 'var(--text)',
          textDecoration: todo.completed ? 'line-through' : 'none',
        }}
      >
        {todo.text}
      </span>

      {/* Due date badge */}
      {todo.dueDate && (() => {
        const date = parseISO(todo.dueDate);
        const overdue = isPast(date) && !isToday(date);
        const dueToday = isToday(date);
        const dueTomorrow = isTomorrow(date);
        const badgeColor = overdue
          ? '#ef4444'
          : dueToday
          ? '#f59e0b'
          : 'var(--text-secondary)';
        return (
          <span
            className="shrink-0 text-xs px-1.5 py-0.5 rounded border"
            style={{
              color: badgeColor,
              borderColor: badgeColor,
              opacity: dueTomorrow || (!overdue && !dueToday) ? 0.7 : 1,
            }}
            aria-label={`Due ${format(date, 'MMM d')}`}
          >
            {format(date, 'MMM d')}
          </span>
        );
      })()}

      {/* Delete */}
      <button
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-70 hover:opacity-100 shrink-0 transition-opacity"
        style={{ color: 'var(--danger)' }}
        aria-label={`Delete todo: ${todo.text}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </li>
  );
}

// ---------------------------------------------------------------------------
// TodoList Widget
// ---------------------------------------------------------------------------

type FilterTab = 'all' | 'active' | 'completed';

export default function TodoList() {
  const { todos, addTodo, toggleTodo, deleteTodo, reorderTodos } = useTodoStore();
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [filter, setFilter] = useState<FilterTab>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAdd = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    addTodo(trimmed, priority, dueDate || undefined);
    setInput('');
    setDueDate('');
  }, [input, priority, dueDate, addTodo]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = todos.findIndex((t) => t.id === active.id);
      const newIndex = todos.findIndex((t) => t.id === over.id);
      reorderTodos(arrayMove(todos, oldIndex, newIndex));
    }
  }

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const tabs: FilterTab[] = ['all', 'active', 'completed'];

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task..."
          className="flex-1 bg-transparent border rounded px-3 py-1.5 text-sm outline-none focus:ring-1"
          style={{
            borderColor: 'var(--card-border)',
            color: 'var(--text)',
            // @ts-expect-error -- CSS custom property
            '--tw-ring-color': 'var(--accent)',
          }}
          aria-label="New todo text"
        />

        {/* Priority selector */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="bg-transparent border rounded px-2 py-1.5 text-xs cursor-pointer outline-none"
          style={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
          aria-label="Todo priority"
        >
          {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
            <option key={p} value={p} style={{ background: 'var(--bg-secondary)' }}>
              {PRIORITY_CONFIG[p].label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-transparent border rounded px-2 py-1.5 text-xs cursor-pointer outline-none"
          style={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
          aria-label="Due date"
        />

        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="px-3 py-1.5 rounded text-sm font-medium transition-opacity disabled:opacity-40"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          aria-label="Add todo"
        >
          Add
        </button>
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-1 border-b pb-2"
        style={{ borderColor: 'var(--card-border)' }}
        role="tablist"
        aria-label="Filter todos"
      >
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={filter === t}
            onClick={() => setFilter(t)}
            className="px-3 py-0.5 rounded text-xs capitalize transition-colors"
            style={{
              background: filter === t ? 'var(--accent)' : 'transparent',
              color: filter === t ? 'var(--bg)' : 'var(--text-secondary)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {filter === 'completed' ? 'No completed tasks yet' : 'All clear! Add a task above'}
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filtered.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul role="list" className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
                {filtered.map((todo) => (
                  <SortableItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Footer count */}
      <p
        className="text-xs shrink-0"
        style={{ color: 'var(--text-secondary)' }}
        aria-live="polite"
      >
        {activeCount} task{activeCount !== 1 ? 's' : ''} remaining
      </p>
    </div>
  );
}
