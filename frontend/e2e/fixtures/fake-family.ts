import { Request } from '@playwright/test';
import { FakeResponse } from './fake-planner';
import { SeedChild } from './seed-data';

type Register = (
  method: string,
  path: string,
  handler: (request: Request, params: Record<string, string>) => FakeResponse,
) => void;

export const interests = [
  { name: 'Dinosaurs', emoji: '🦕' },
  { name: 'Science', emoji: '🔬' },
  { name: 'Digging', emoji: '⛏️' },
  { name: 'Space', emoji: '🚀' },
  { name: 'Art', emoji: '🎨' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'Unicorns', emoji: '🦄' },
  { name: 'Trains', emoji: '🚂' },
  { name: 'Ocean', emoji: '🐠' },
  { name: 'Superheroes', emoji: '🦸' },
  { name: 'Bubbles', emoji: '🫧' },
  { name: 'Dogs', emoji: '🐶' },
];

/** The fake's "today" in Toronto. */
const today = '2026-10-25';
const dayMs = 86_400_000;

interface ChildBody {
  firstName: string;
  birthday: string;
  interests: string[];
  allergies: string | null;
}

/** Children in the family, as the API answers them. */
export class FakeFamily {
  /** Bodies of saved children, newest last. */
  saved: ChildBody[] = [];
  /** When set, saving a child fails as a dropped connection would. */
  failSaves = false;
  private nextId = 1;

  constructor(private readonly children: () => SeedChild[]) {}

  register(on: Register): void {
    on('GET', '/api/family/interests', () => ({ body: interests }));
    on('POST', '/api/family/children', (request) => this.save(request, null));
    on('PUT', '/api/family/children/:childId', (request, { childId }) =>
      this.save(request, childId),
    );
    on('DELETE', '/api/family/children/:childId', (_, { childId }) => {
      const list = this.children();
      const index = list.findIndex((c) => c.id === childId);
      if (index < 0) return { status: 404 };
      list.splice(index, 1);
      return { status: 204 };
    });
  }

  private save(request: Request, childId: string | null): FakeResponse {
    if (this.failSaves) return { status: 503, body: { status: 503, title: 'Unavailable' } };
    const body = request.postDataJSON() as ChildBody;
    this.saved.push(body);
    const errors: Record<string, string[]> = {};
    if (!body.firstName?.trim()) errors['firstName'] = ['Enter your child’s first name'];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.birthday ?? '') || body.birthday >= today)
      errors['birthday'] = ['Enter a birthday in the past, like 14 Nov 2019'];
    if ((body.interests ?? []).length > 5) errors['interests'] = ['Pick up to 5'];
    if (Object.keys(errors).length)
      return { status: 400, body: { status: 400, title: 'Some details need fixing.', errors } };
    const list = this.children();
    const existing = childId ? list.find((c) => c.id === childId) : undefined;
    if (childId && !existing) return { status: 404 };
    const child = { ...(existing ?? { id: `child-${this.nextId++}` }), ...view(body) } as SeedChild;
    if (existing) Object.assign(existing, child);
    else list.push(child);
    return { status: childId ? 200 : 201, body: child };
  }
}

function view(body: ChildBody): Omit<SeedChild, 'id'> {
  const [year, month, day] = body.birthday.split('-').map(Number);
  let next = `${today.slice(0, 4)}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  if (next < today) next = `${Number(today.slice(0, 4)) + 1}${next.slice(4)}`;
  return {
    firstName: body.firstName.trim(),
    birthday: body.birthday,
    nextBirthday: next,
    turningAge: Number(next.slice(0, 4)) - year,
    daysUntil: Math.round(
      (Date.parse(`${next}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / dayMs,
    ),
    interests: body.interests ?? [],
    allergies: body.allergies?.trim() || null,
    partyId: null,
  };
}
