import { NextResponse } from 'next/server';
import {
  checkConnection,
  pullTodos,
  pushTodo,
  updateTodoStatus,
  pullProjects,
  updateProject,
  pushWorkoutLog,
} from '@/lib/notion';

// ---------------------------------------------------------------------------
// GET /api/notion — pull data from Notion
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type'); // 'todos' | 'projects' | 'status'

  try {
    switch (type) {
      case 'status': {
        const connected = await checkConnection();
        return NextResponse.json({ connected });
      }
      case 'todos': {
        const todos = await pullTodos();
        return NextResponse.json({ todos });
      }
      case 'projects': {
        const projects = await pullProjects();
        return NextResponse.json({ projects });
      }
      default:
        return NextResponse.json({ error: 'Invalid type. Use: status, todos, projects' }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Notion API error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/notion — push data to Notion
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'push-todo': {
        const { text, done } = body;
        const id = await pushTodo({ text, done: done ?? false });
        return NextResponse.json({ id });
      }
      case 'update-todo-status': {
        const { pageId, done } = body;
        await updateTodoStatus(pageId, done);
        return NextResponse.json({ ok: true });
      }
      case 'update-project': {
        const { pageId, status, description, githubUrl } = body;
        await updateProject(pageId, { status, description, githubUrl });
        return NextResponse.json({ ok: true });
      }
      case 'push-workout': {
        const { date, workoutType, exercises } = body;
        const id = await pushWorkoutLog({ date, workoutType, exercises });
        return NextResponse.json({ id });
      }
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: push-todo, update-todo-status, update-project, push-workout' },
          { status: 400 }
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Notion API error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
