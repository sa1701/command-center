'use client';

import { type ReactNode } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useLayoutStore } from '@/lib/widget-store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardGridProps {
  children: ReactNode;
  widgetIds?: string[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * DashboardGrid
 *
 * Responsive CSS Grid container with drag-and-drop reordering via @dnd-kit.
 * On small screens it uses 1 column, stepping up to 2 → 3 → 4 at each
 * breakpoint. Widgets that should span multiple columns must apply
 * `col-span-*` classes on their own wrappers.
 */
export default function DashboardGrid({ children, widgetIds }: DashboardGridProps) {
  const setWidgetOrder = useLayoutStore((s) => s.setWidgetOrder);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !widgetIds) return;

    const oldIndex = widgetIds.indexOf(String(active.id));
    const newIndex = widgetIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = [...widgetIds];
    const [moved] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, moved);
    setWidgetOrder(newOrder);
  };

  const gridContent = (
    <main
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
        gap-4
        p-4
        md:p-6
        w-full
        min-h-screen
        auto-rows-min
      "
      aria-label="Dashboard widget grid"
    >
      {children}
    </main>
  );

  if (!widgetIds) return gridContent;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={widgetIds} strategy={rectSortingStrategy}>
        {gridContent}
      </SortableContext>
    </DndContext>
  );
}
