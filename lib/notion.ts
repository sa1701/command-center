/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from '@notionhq/client';

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

let _notion: Client | null = null;

export function getNotionClient(): Client | null {
  const key = process.env.NOTION_API_KEY;
  if (!key) return null;
  if (!_notion) _notion = new Client({ auth: key });
  return _notion;
}

// ---------------------------------------------------------------------------
// Data Source IDs (Notion v5 SDK uses "data sources" instead of "databases")
// ---------------------------------------------------------------------------

export const DB = {
  tasks: process.env.NOTION_TASKS_DB ?? '',
  projects: process.env.NOTION_PROJECTS_DB ?? '',
  workouts: process.env.NOTION_WORKOUTS_DB ?? '',
} as const;

// ---------------------------------------------------------------------------
// Types (matching dashboard store shapes)
// ---------------------------------------------------------------------------

export interface NotionTodo {
  id: string;          // Notion page ID
  text: string;
  done: boolean;
  priority?: string;   // High / Medium / Low
  dueDate?: string;    // ISO date
  area?: string;       // Health / Finance / Career / Personal
}

export interface NotionProject {
  id: string;
  name: string;
  status: string;      // Idea / In Progress / Paused / Done
  description: string;
  githubUrl: string;
  languages: string[];
}

export interface NotionWorkoutLog {
  date: string;
  workoutType: string;
  exercises: string;   // JSON string of exercise data
}

// ---------------------------------------------------------------------------
// Status mapping: dashboard ↔ Notion
// ---------------------------------------------------------------------------

const TODO_STATUS_TO_NOTION: Record<string, string> = {
  false: 'Active',     // not done → Active
  true: 'Done',        // done → Done
};

const NOTION_STATUS_TO_DONE: Record<string, boolean> = {
  'Not Started': false,
  'Active': false,
  'Done': true,
};

const PROJECT_STATUS_TO_NOTION: Record<string, string> = {
  not_started: 'Idea',
  in_progress: 'In Progress',
  complete: 'Done',
};

const NOTION_STATUS_TO_PROJECT: Record<string, string> = {
  'Idea': 'not_started',
  'In Progress': 'in_progress',
  'Paused': 'in_progress',
  'Done': 'complete',
};

// ---------------------------------------------------------------------------
// Pull: Todos from Notion
// ---------------------------------------------------------------------------

export async function pullTodos(): Promise<NotionTodo[]> {
  const notion = getNotionClient();
  if (!notion || !DB.tasks) return [];

  const res = await notion.dataSources.query({
    data_source_id: DB.tasks,
    filter: {
      property: 'Type',
      select: { equals: 'Task' },
    },
    sorts: [{ property: 'Name', direction: 'ascending' }],
  });

  return res.results.map((page: any) => {
    const props = page.properties;
    return {
      id: page.id,
      text: props.Name?.title?.[0]?.plain_text ?? '',
      done: NOTION_STATUS_TO_DONE[props.Status?.select?.name ?? ''] ?? false,
      priority: props.Priority?.select?.name,
      dueDate: props['Due Date']?.date?.start,
      area: props.Area?.select?.name,
    };
  });
}

// ---------------------------------------------------------------------------
// Push: Todo to Notion
// ---------------------------------------------------------------------------

export async function pushTodo(todo: { text: string; done: boolean }): Promise<string | null> {
  const notion = getNotionClient();
  if (!notion || !DB.tasks) return null;

  const page = await notion.pages.create({
    parent: { data_source_id: DB.tasks },
    properties: {
      Name: { title: [{ text: { content: todo.text } }] },
      Status: { select: { name: TODO_STATUS_TO_NOTION[String(todo.done)] } },
      Type: { select: { name: 'Task' } },
    },
  });
  return page.id;
}

// ---------------------------------------------------------------------------
// Update: Todo status in Notion
// ---------------------------------------------------------------------------

export async function updateTodoStatus(pageId: string, done: boolean): Promise<void> {
  const notion = getNotionClient();
  if (!notion) return;

  await notion.pages.update({
    page_id: pageId,
    properties: {
      Status: { select: { name: TODO_STATUS_TO_NOTION[String(done)] } },
    },
  });
}

// ---------------------------------------------------------------------------
// Pull: Projects from Notion
// ---------------------------------------------------------------------------

export async function pullProjects(): Promise<NotionProject[]> {
  const notion = getNotionClient();
  if (!notion || !DB.projects) return [];

  const res = await notion.dataSources.query({
    data_source_id: DB.projects,
    sorts: [{ property: 'Name', direction: 'ascending' }],
  });

  return res.results.map((page: any) => {
    const props = page.properties;
    return {
      id: page.id,
      name: props.Name?.title?.[0]?.plain_text ?? '',
      status: NOTION_STATUS_TO_PROJECT[props.Status?.select?.name ?? ''] ?? 'not_started',
      description: props.Description?.rich_text?.[0]?.plain_text ?? '',
      githubUrl: props['GitHub URL']?.url ?? '',
      languages: props.Language?.multi_select?.map((l: any) => l.name) ?? [],
    };
  });
}

// ---------------------------------------------------------------------------
// Push: Update project in Notion
// ---------------------------------------------------------------------------

export async function updateProject(
  pageId: string,
  data: { status?: string; description?: string; githubUrl?: string }
): Promise<void> {
  const notion = getNotionClient();
  if (!notion) return;

  const properties: Record<string, any> = {};
  if (data.status) {
    const notionStatus = PROJECT_STATUS_TO_NOTION[data.status];
    if (notionStatus) properties.Status = { select: { name: notionStatus } };
  }
  if (data.description !== undefined) {
    properties.Description = { rich_text: [{ text: { content: data.description } }] };
  }
  if (data.githubUrl !== undefined) {
    properties['GitHub URL'] = { url: data.githubUrl || null };
  }

  if (Object.keys(properties).length > 0) {
    await notion.pages.update({ page_id: pageId, properties });
  }
}

// ---------------------------------------------------------------------------
// Push: Workout log to Notion
// ---------------------------------------------------------------------------

export async function pushWorkoutLog(log: NotionWorkoutLog): Promise<string | null> {
  const notion = getNotionClient();
  if (!notion || !DB.workouts) return null;

  const page = await notion.pages.create({
    parent: { data_source_id: DB.workouts },
    properties: {
      Name: { title: [{ text: { content: `${log.date} - ${log.workoutType}` } }] },
      Date: { date: { start: log.date } },
      'Workout Type': { select: { name: log.workoutType } },
      Exercises: { rich_text: [{ text: { content: log.exercises.slice(0, 2000) } }] },
    },
  });
  return page.id;
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

export async function checkConnection(): Promise<boolean> {
  const notion = getNotionClient();
  if (!notion) return false;
  try {
    await notion.users.me({});
    return true;
  } catch {
    return false;
  }
}
