import { Request } from '@playwright/test';
import { FakeResponse } from './fake-planner';
import { dinoParty } from './seed-data';

type Register = (
  method: string,
  path: string,
  handler: (request: Request, params: Record<string, string>) => FakeResponse,
) => void;

export interface SeedStep {
  id: string;
  time: string;
  title: string;
  details: string;
  who: string;
  reminder: string | null;
}

const step = (
  n: number,
  time: string,
  title: string,
  details: string,
  who: string,
  reminder: string | null = null,
): SeedStep => ({
  id: `b2200000-0000-4000-8000-0000000000${String(n).padStart(2, '0')}`,
  time,
  title,
  details,
  who,
  reminder,
});

/** Zuri's day, as Giddy drafts it from her plan. */
export const seedSteps: SeedStep[] = [
  step(
    1,
    '12:15',
    'Arrive and set up',
    'Dino Den Play Café · set up the room and the gift table',
    'Amara',
  ),
  step(2, '12:45', 'Pizza Nonna delivery', '6 large pizzas and juice boxes', 'Pizza Nonna'),
  step(3, '13:00', 'Guests arrive', 'Greet families and check names against the guest list', 'Bea'),
  step(
    4,
    '13:30',
    'Professor Fizz’s Volcano Lab',
    '45 min show · kids sit together at the front',
    'Professor Fizz’s Volcano Lab',
  ),
  step(
    5,
    '14:15',
    'Food and drinks',
    'Pizza Nonna · juice and water',
    'Amara',
    'Peanut (EpiPen with parent) for Arjun · dairy-free for Maya · gluten-free (celiac) for Hana',
  ),
  step(
    6,
    '14:45',
    'Cake and Happy Birthday',
    'Sweet Rex Bakery cake · candles and lighter in the kit',
    'Amara',
  ),
  step(7, '15:10', 'Loot bags', 'One per kid at the door', 'Amara'),
  step(
    8,
    '15:30',
    'Pick-up and goodbyes',
    'Check every kid leaves with a grown-up on the list',
    'Amara',
  ),
];

export const seedContacts = [
  { name: 'Bea', role: 'Dino Den Play Café host', phone: '4165550142' },
  { name: 'Professor Fizz’s Volcano Lab', role: 'Entertainer', phone: '4165550163' },
  { name: 'Pizza Nonna', role: 'Food', phone: '4165550110' },
];

interface PartyFacts {
  date: string;
  startsAt: string;
  endsAt: string;
  status: string;
}

/** The party-day run sheet, as the API answers it. */
export class FakeRunSheet {
  /** Steps by party id; parties without an entry have no run sheet yet. */
  steps = new Map<string, SeedStep[]>([[dinoParty.id, structuredClone(seedSteps)]]);

  constructor(
    private readonly party: (partyId: string) => PartyFacts | null,
    private readonly allergies: () => { child: string; allergy: string }[],
    private readonly coming: () => number,
  ) {}

  register(on: Register): void {
    on('GET', '/api/parties/:partyId/run-sheet', (_, { partyId }) =>
      this.party(partyId) ? { body: this.view(partyId) } : { status: 404 },
    );
    on('POST', '/api/parties/:partyId/run-sheet/draft', (_, { partyId }) => {
      const party = this.party(partyId);
      if (!party) return { status: 404 };
      if (this.steps.get(partyId)?.length)
        return { status: 409, body: { status: 409, title: 'This party already has a run sheet.' } };
      if (party.status === 'draft')
        return {
          status: 409,
          body: {
            status: 409,
            title: 'Add bookings to the plan first, then Giddy can draft the run sheet.',
          },
        };
      this.steps.set(partyId, structuredClone(seedSteps));
      return { body: this.view(partyId) };
    });
  }

  private view(partyId: string) {
    const party = this.party(partyId)!;
    const planned = party.status !== 'draft';
    return {
      date: party.date,
      startsAt: party.startsAt,
      endsAt: party.endsAt,
      coming: planned ? this.coming() : 0,
      steps: this.steps.get(partyId) ?? [],
      contacts: planned ? seedContacts : [],
      allergies: planned ? this.allergies() : [],
    };
  }
}
