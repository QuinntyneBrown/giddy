import { Request } from '@playwright/test';
import { FakeResponse } from './fake-planner';
import { dinoParty } from './seed-data';

type Register = (
  method: string,
  path: string,
  handler: (request: Request, params: Record<string, string>) => FakeResponse,
) => void;

export interface SeedNotification {
  id: string;
  icon: string;
  title: string;
  detail: string;
  link: string;
  createdAt: string;
  read: boolean;
}

const item = (
  n: number,
  icon: string,
  title: string,
  detail: string,
  link: string,
  createdAt: string,
  read: boolean,
): SeedNotification => ({
  id: `c3300000-0000-4000-8000-0000000000${String(n).padStart(2, '0')}`,
  icon,
  title,
  detail,
  link,
  createdAt,
  read,
});

/** Amara's notifications on Sun 25 Oct 2026 at noon in Toronto: three new, three earlier. */
export const seedNotifications: SeedNotification[] = [
  item(
    1,
    '💌',
    'Lily Chen replied: Maya is coming!',
    'Maya is dairy-free; added to the allergy list.',
    `/parties/${dinoParty.id}/guests`,
    '2026-10-25T14:00:00Z',
    false,
  ),
  item(
    2,
    '🧪',
    'Professor Fizz sent a quote: $195',
    '45-minute Volcano Lab show at 1:30 pm.',
    `/parties/${dinoParty.id}`,
    '2026-10-24T15:00:00Z',
    false,
  ),
  item(
    3,
    '⏰',
    'Overdue: share the allergy list with Dino Den',
    'It was due Sat 24 Oct. Giddy can send it for you.',
    `/parties/${dinoParty.id}/checklist`,
    '2026-10-24T13:00:00Z',
    false,
  ),
  item(
    4,
    '✅',
    'Dino Den confirmed your booking',
    'Sat 14 Nov, 1:00–3:30 pm.',
    `/parties/${dinoParty.id}`,
    '2026-10-18T14:00:00Z',
    true,
  ),
  item(
    5,
    '👋',
    'Kemi Okafor joined your plan',
    'They can now edit Zuri’s Dino Dig 7th with you.',
    `/parties/${dinoParty.id}`,
    '2026-10-17T14:00:00Z',
    true,
  ),
  item(
    6,
    '🎂',
    'Giddy found a gluten-free cake that fits',
    'Sweet Rex makes a nut-free, gluten-free dino cake for $95.',
    '/vendors',
    '2026-10-16T14:00:00Z',
    true,
  ),
];

/** The notification centre, as the API answers it. */
export class FakeNotifications {
  items = structuredClone(seedNotifications);

  register(on: Register): void {
    on('GET', '/api/notifications', () => ({ body: this.view() }));
    on('GET', '/api/notifications/unread-count', () => ({ body: { unread: this.unread() } }));
    on('POST', '/api/notifications/read-all', () => {
      this.items.forEach((i) => (i.read = true));
      return { body: { unread: 0 } };
    });
    on('POST', '/api/notifications/:itemId/read', (_, { itemId }) => {
      const found = this.items.find((i) => i.id === itemId);
      if (!found) return { status: 404 };
      found.read = true;
      return { body: { unread: this.unread() } };
    });
  }

  private unread(): number {
    return this.items.filter((i) => !i.read).length;
  }

  private view() {
    const sorted = [...this.items].sort(
      (a, b) => Number(a.read) - Number(b.read) || b.createdAt.localeCompare(a.createdAt),
    );
    return { unread: this.unread(), items: sorted };
  }
}
