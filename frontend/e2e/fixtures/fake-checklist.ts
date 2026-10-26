import { Request } from '@playwright/test';
import { FakeResponse } from './fake-planner';
import { amara, dinoParty } from './seed-data';

type Register = (
  method: string,
  path: string,
  handler: (request: Request, params: Record<string, string>) => FakeResponse,
) => void;

export interface SeedTask {
  id: string;
  title: string;
  due: string;
  done: boolean;
  doneOn: string | null;
  ownerId: string;
  remindMe: boolean;
  giddyAction: 'allergyList' | 'rsvpReminder' | null;
}

interface PartyFacts {
  date: string;
  status: string;
}

const kemi = { parentId: '0b7f6d1e-3c2a-4b8e-a1f0-5d6c7e8f9a02', name: 'Kemi Okafor' };
const planners = [{ parentId: amara.parentId, name: amara.name }, kemi];
/** The fake's "today" in Toronto, matching the overview's overdue tasks. */
export const checklistToday = '2026-10-25';

const task = (n: number, title: string, due: string, more: Partial<SeedTask> = {}): SeedTask => ({
  id: `a1100000-0000-4000-8000-0000000000${String(n).padStart(2, '0')}`,
  title,
  due,
  done: false,
  doneOn: null,
  ownerId: amara.parentId,
  remindMe: true,
  giddyAction: null,
  ...more,
});

/** Zuri's checklist: 3 of 10 done, 1 overdue, 2 due this week. */
export const seedTasks: SeedTask[] = [
  task(1, 'Book the venue', '2026-10-17', { done: true, doneOn: '2026-10-16' }),
  task(2, 'Book the entertainer', '2026-10-20'),
  task(3, 'Send invitations', '2026-10-24', { done: true, doneOn: '2026-10-20' }),
  task(4, 'Send an RSVP reminder', '2026-10-30', { giddyAction: 'rsvpReminder' }),
  task(5, 'Order the cake', '2026-10-31'),
  task(6, 'Share the allergy list with the venue', '2026-11-04', { giddyAction: 'allergyList' }),
  task(7, 'Order loot bags', '2026-11-04', { done: true, doneOn: '2026-10-22' }),
  task(8, 'Confirm final numbers with the venue', '2026-11-11'),
  task(9, 'Order the food', '2026-11-12', { ownerId: kemi.parentId }),
  task(10, 'Pack the party-day kit', '2026-11-13'),
];

const offsets: [string, number, SeedTask['giddyAction']][] = [
  ['Book the venue', 28, null],
  ['Book the entertainer', 25, null],
  ['Send invitations', 21, null],
  ['Order the cake', 10, null],
  ['Share the allergy list with the venue', 10, 'allergyList'],
  ['Order loot bags', 10, null],
  ['Send an RSVP reminder', 7, 'rsvpReminder'],
  ['Confirm final numbers with the venue', 3, null],
  ['Order the food', 2, null],
  ['Pack the party-day kit', 1, null],
];

const day = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
const plusDays = (iso: string, days: number) =>
  new Date(Date.parse(`${iso}T12:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);

/** The checklist, as the API answers it, for "today" in Toronto. */
export class FakeChecklist {
  /** Tasks by party id; parties without an entry have none. */
  tasks = new Map<string, SeedTask[]>([[dinoParty.id, structuredClone(seedTasks)]]);
  private nextId = 1;

  constructor(
    private readonly party: (partyId: string) => PartyFacts | null,
    private readonly waitingFamilies: () => number,
    private readonly venueName: () => string | null,
  ) {}

  register(on: Register): void {
    on('GET', '/api/parties/:partyId/tasks', (_, { partyId }) =>
      this.party(partyId) ? { body: this.view(partyId) } : { status: 404 },
    );
    on('POST', '/api/parties/:partyId/tasks', (request, { partyId }) => {
      const invalid = this.validate(request, partyId);
      if (invalid) return invalid;
      const body = request.postDataJSON() as Pick<SeedTask, 'title' | 'due' | 'remindMe'> & {
        ownerId: string | null;
      };
      const added: SeedTask = {
        id: `task-${this.nextId++}`,
        title: body.title.trim(),
        due: body.due,
        done: false,
        doneOn: null,
        ownerId: body.ownerId ?? amara.parentId,
        remindMe: body.remindMe,
        giddyAction: null,
      };
      this.tasks.set(partyId, [...this.list(partyId), added]);
      return { status: 201, body: this.taskView(added) };
    });
    on('PUT', '/api/parties/:partyId/tasks/:taskId', (request, { partyId, taskId }) => {
      const existing = this.list(partyId).find((t) => t.id === taskId);
      if (!existing) return { status: 404 };
      const invalid = this.validate(request, partyId);
      if (invalid) return invalid;
      const body = request.postDataJSON() as Pick<SeedTask, 'title' | 'due' | 'remindMe'> & {
        ownerId: string | null;
      };
      Object.assign(existing, {
        title: body.title.trim(),
        due: body.due,
        ownerId: body.ownerId ?? amara.parentId,
        remindMe: body.remindMe,
      });
      return { body: this.taskView(existing) };
    });
    on('DELETE', '/api/parties/:partyId/tasks/:taskId', (_, { partyId, taskId }) => {
      if (!this.list(partyId).some((t) => t.id === taskId)) return { status: 404 };
      this.tasks.set(
        partyId,
        this.list(partyId).filter((t) => t.id !== taskId),
      );
      return { status: 204 };
    });
    on('PUT', '/api/parties/:partyId/tasks/:taskId/done', (request, { partyId, taskId }) => {
      const existing = this.list(partyId).find((t) => t.id === taskId);
      if (!existing) return { status: 404 };
      const { done } = request.postDataJSON() as { done: boolean };
      this.setDone(existing, done);
      return { body: this.taskView(existing) };
    });
    on('POST', '/api/parties/:partyId/tasks/:taskId/giddy', (_, { partyId, taskId }) => {
      const existing = this.list(partyId).find((t) => t.id === taskId);
      if (!existing) return { status: 404 };
      if (existing.done || !existing.giddyAction)
        return { status: 409, body: { status: 409, title: 'Giddy can’t do this task for you.' } };
      let message: string;
      if (existing.giddyAction === 'allergyList') {
        const venue = this.venueName();
        if (!venue)
          return {
            status: 409,
            body: {
              status: 409,
              title: 'Book a venue first, then share the allergy list with it.',
            },
          };
        message = `Allergy list sent to ${venue}`;
      } else {
        const waiting = this.waitingFamilies();
        if (!waiting)
          return {
            status: 409,
            body: { status: 409, title: 'Everyone has replied, so there’s no one to remind.' },
          };
        message =
          waiting === 1 ? 'Reminder sent to 1 family' : `Reminders sent to ${waiting} families`;
      }
      this.setDone(existing, true);
      return { body: { message } };
    });
    on('POST', '/api/parties/:partyId/tasks/generate', (_, { partyId }) => {
      const party = this.party(partyId);
      if (!party) return { status: 404 };
      if (this.list(partyId).length)
        return { status: 409, body: { status: 409, title: 'This party already has a checklist.' } };
      this.tasks.set(
        partyId,
        offsets.map(([title, before, giddyAction]) => {
          const due = plusDays(party.date, -before);
          return {
            id: `task-${this.nextId++}`,
            title,
            due: due < checklistToday ? checklistToday : due,
            done: false,
            doneOn: null,
            ownerId: amara.parentId,
            remindMe: true,
            giddyAction,
          };
        }),
      );
      return { body: this.view(partyId) };
    });
  }

  /** What a co-planner's tick looks like from here. */
  tick(partyId: string, title: string): void {
    this.setDone(
      this.list(partyId).find((t) => t.title === title)!,
      true,
    );
  }

  private list(partyId: string): SeedTask[] {
    return this.tasks.get(partyId) ?? [];
  }

  private setDone(t: SeedTask, done: boolean): void {
    t.done = done;
    t.doneOn = done ? (t.doneOn ?? checklistToday) : null;
  }

  private view(partyId: string) {
    const party = this.party(partyId)!;
    const tasks = [...this.list(partyId)]
      .sort((a, b) => a.due.localeCompare(b.due))
      .map((t) => this.taskView(t));
    const done = tasks.filter((t) => t.done).length;
    const weekEnd = plusDays(checklistToday, 7);
    return {
      done,
      total: tasks.length,
      percent: tasks.length ? Math.round((100 * done) / tasks.length) : 0,
      overdue: tasks.filter((t) => t.overdue).length,
      next: tasks.find((t) => !t.done)?.title ?? null,
      partyDate: party.date,
      groups: [
        { name: 'Overdue', tasks: tasks.filter((t) => t.overdue) },
        {
          name: 'This week',
          tasks: tasks.filter((t) => !t.done && t.due >= checklistToday && t.due < weekEnd),
        },
        { name: 'Before the party', tasks: tasks.filter((t) => !t.done && t.due >= weekEnd) },
        { name: 'Done', tasks: tasks.filter((t) => t.done) },
      ],
      planners: planners.map((p) => ({ ...p, isYou: p.parentId === amara.parentId })),
    };
  }

  private taskView(t: SeedTask) {
    return {
      id: t.id,
      title: t.title,
      due: t.due,
      done: t.done,
      doneOn: t.doneOn,
      overdue: !t.done && t.due < checklistToday,
      ownerId: t.ownerId,
      ownerName: planners.find((p) => p.parentId === t.ownerId)?.name ?? 'A planner',
      remindMe: t.remindMe,
      giddyCanDo: t.done ? null : t.giddyAction,
    };
  }

  private validate(request: Request, partyId: string): FakeResponse | null {
    const body = request.postDataJSON() as { title?: string; due?: string; ownerId?: string };
    const party = this.party(partyId)!;
    const errors: Record<string, string[]> = {};
    if (!body.title?.trim()) errors['title'] = ['Say what needs doing'];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.due ?? '')) errors['due'] = ['Choose the date it’s due'];
    else if (body.due! > party.date)
      errors['due'] = [`Choose a date on or before the party, ${day(party.date)}`];
    if (body.ownerId && !planners.some((p) => p.parentId === body.ownerId))
      errors['ownerId'] = ['Choose someone who is planning this party'];
    return Object.keys(errors).length
      ? { status: 400, body: { status: 400, title: 'Some details need fixing.', errors } }
      : null;
  }
}
