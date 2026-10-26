import { Checklist, ChecklistTask } from '@giddy/api';

/** The checklist with one task ticked or unticked on this device, regrouped for today. */
export function withTick(
  checklist: Checklist,
  taskId: string,
  done: boolean,
  today: string,
): Checklist {
  const all = checklist.groups.flatMap((g) => g.tasks);
  const tasks = all
    .map((t): ChecklistTask =>
      t.id === taskId
        ? { ...t, done, doneOn: done ? (t.doneOn ?? today) : null, overdue: !done && t.due < today }
        : t,
    )
    .sort((a, b) => a.due.localeCompare(b.due));
  const weekEnd = new Date(Date.parse(`${today}T12:00:00Z`) + 7 * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const doneCount = tasks.filter((t) => t.done).length;
  return {
    ...checklist,
    done: doneCount,
    percent: tasks.length ? Math.round((100 * doneCount) / tasks.length) : 0,
    overdue: tasks.filter((t) => t.overdue).length,
    next: tasks.find((t) => !t.done)?.title ?? null,
    groups: [
      { name: 'Overdue', tasks: tasks.filter((t) => t.overdue) },
      {
        name: 'This week',
        tasks: tasks.filter((t) => !t.done && t.due >= today && t.due < weekEnd),
      },
      { name: 'Before the party', tasks: tasks.filter((t) => !t.done && t.due >= weekEnd) },
      { name: 'Done', tasks: tasks.filter((t) => t.done) },
    ],
  };
}
