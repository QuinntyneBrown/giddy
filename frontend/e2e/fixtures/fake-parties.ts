import { Request } from '@playwright/test';
import {
  dinoBookings,
  family,
  homeNudges,
  kofisDraft,
  overviewOf,
  plannedDino,
  SeedSummary,
  zurisSixth,
} from './seed-data';
import { FakeResponse } from './fake-planner';

type Register = (
  method: string,
  path: string,
  handler: (request: Request, params: Record<string, string>) => FakeResponse,
) => void;

const ordinal = (n: number) =>
  `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : (({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th')}`;

/** Parties, the family and Home, answered the way the API does. */
export class FakeParties {
  parties: SeedSummary[] = [{ ...plannedDino }, { ...kofisDraft }, { ...zurisSixth }];
  family = structuredClone(family);
  bookings = structuredClone(dinoBookings);
  nudges = structuredClone(homeNudges);
  /** Bodies of POST /api/parties, newest last. */
  created: Record<string, unknown>[] = [];
  deleted: string[] = [];

  register(on: Register, startConversation: (partyId: string) => unknown): void {
    on('GET', '/api/parties', () => ({ body: this.parties }));
    on('GET', '/api/family', () => ({ body: this.family }));
    on('GET', '/api/budget-guide', (request) => {
      const guests = Number(new URL(request.url()).searchParams.get('guests'));
      return {
        body: {
          guests,
          low: Math.floor((300 + 20 * guests) / 50) * 50,
          high: Math.round((500 + 38 * guests) / 100) * 100,
        },
      };
    });
    on('POST', '/api/parties', (request) => {
      const body = request.postDataJSON() as Record<string, unknown>;
      this.created.push(body);
      const child = this.family.children.find((c) => c.id === body['childId']);
      const name = child
        ? `${child.firstName}’s ${ordinal(child.turningAge)} birthday`
        : `${body['childName']}’s ${ordinal(Number(body['turningAge']))} birthday`;
      const party: SeedSummary = {
        id: `9f9f9f9f-0000-4000-8000-${String(this.created.length).padStart(12, '0')}`,
        name,
        date: String(body['date']),
        startsAt: '13:00',
        endsAt: '15:30',
        role: 'owner',
        daysToGo: 20,
        status: 'draft',
        readiness: 0,
        venueName: null,
        theme: null,
        locked: false,
        guests: Number(body['guests']),
        budget: Number(body['budget']),
      };
      this.parties.push(party);
      return { status: 201, body: party };
    });
    on('GET', '/api/parties/:partyId', (_, params) => {
      const party = this.find(params['partyId']);
      return party ? { body: party } : { status: 404 };
    });
    on('GET', '/api/parties/:partyId/overview', (_, params) => {
      const party = this.find(params['partyId']);
      return party ? { body: overviewOf(party) } : { status: 404 };
    });
    on('GET', '/api/parties/:partyId/bookings', (_, params) => {
      const party = this.find(params['partyId']);
      if (!party) return { status: 404 };
      return { body: party.status === 'draft' ? [] : this.bookings };
    });
    on('DELETE', '/api/parties/:partyId', (_, params) => {
      const party = this.find(params['partyId']);
      if (!party) return { status: 404 };
      if (party.role !== 'owner') return { status: 403 };
      this.deleted.push(party.id);
      this.parties = this.parties.filter((p) => p !== party);
      return { status: 204 };
    });
    on('POST', '/api/parties/:partyId/conversations', (_, params) =>
      this.find(params['partyId'])
        ? { body: startConversation(params['partyId']) }
        : { status: 404 },
    );
    on('GET', '/api/home', () => ({ body: this.home() }));
    on('GET', '/api/home/nudges', () => ({ body: this.nudges }));
  }

  home() {
    const upcoming = this.parties
      .filter((p) => !p.locked)
      .sort((a, b) => a.date.localeCompare(b.date));
    const next = upcoming[0];
    return {
      partiesInProgress: upcoming.length,
      needsYou: this.nudges.length,
      nextParty: next
        ? {
            id: next.id,
            name: next.name,
            date: next.date,
            startsAt: next.startsAt,
            endsAt: next.endsAt,
            daysToGo: next.daysToGo,
            venueName: next.venueName,
            guests: next.guests,
            readiness: next.readiness,
            doneSteps: 4,
            totalSteps: 15,
            nextStep: next.venueName ? 'Book Professor Fizz’s Volcano Lab' : null,
          }
        : null,
      rsvps: { coming: 0, waiting: 0, cantCome: 0 },
      allergies: next ? 1 : 0,
      nextBirthday: {
        childId: this.family.children[1].id,
        firstName: 'Kofi',
        turningAge: 4,
        date: '2027-02-03',
        daysAway: 101,
      },
    };
  }

  private find(id: string) {
    return this.parties.find((p) => p.id === id);
  }
}
