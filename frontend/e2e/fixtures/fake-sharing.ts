import { Request } from '@playwright/test';
import { FakeResponse } from './fake-planner';
import { amara, dinoParty } from './seed-data';

type Register = (
  method: string,
  path: string,
  handler: (request: Request, params: Record<string, string>) => FakeResponse,
) => void;

type Role = 'owner' | 'coPlanner' | 'viewer';

export interface SeedMember {
  parentId: string;
  name: string;
  role: Role;
}

/** Planners, invitations, joining and the view-only link, as the API answers them. */
export class FakeSharing {
  members: SeedMember[] = [
    { parentId: amara.parentId, name: 'Amara Okafor', role: 'owner' },
    { parentId: '0b7f6d1e-3c2a-4b8e-a1f0-5d6c7e8f9a02', name: 'Kemi Okafor', role: 'coPlanner' },
  ];
  invited: { email: string; role: Role }[] = [];
  shareLinks = 0;

  register(on: Register): void {
    on('GET', '/api/parties/:partyId/members', () => ({
      body: {
        members: this.members.map((m) => ({ ...m, isYou: m.parentId === amara.parentId })),
        invited: this.invited,
      },
    }));
    on('POST', '/api/parties/:partyId/members', (request) => {
      const body = request.postDataJSON() as { email: string; role: Role };
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email ?? ''))
        return {
          status: 400,
          body: {
            status: 400,
            title: 'Some details need fixing.',
            errors: { email: ['Enter an email address like name@example.com'] },
          },
        };
      this.invited.push({ email: body.email.trim().toLowerCase(), role: body.role });
      return { status: 201 };
    });
    on('DELETE', '/api/parties/:partyId/members/:parentId', (_, { parentId }) => {
      const member = this.members.find((m) => m.parentId === parentId);
      if (!member) return { status: 404 };
      if (member.role === 'owner')
        return { status: 403, body: { status: 403, title: 'The party’s owner can’t be removed.' } };
      this.members = this.members.filter((m) => m.parentId !== parentId);
      return { status: 204 };
    });
    on('POST', '/api/parties/:partyId/share-link', (_, { partyId }) => {
      this.shareLinks++;
      return {
        body: {
          token: `share-${partyId.slice(0, 8)}`,
          url: `/shared/share-${partyId.slice(0, 8)}`,
        },
      };
    });
    on('POST', '/api/parties/join', (request) => {
      const { token } = request.postDataJSON() as { token: string };
      return token === 'good-invite'
        ? { body: { partyId: dinoParty.id, partyName: dinoParty.name } }
        : {
            status: 410,
            body: { status: 410, title: 'This invitation has expired. Ask for a new one.' },
          };
    });
    on('GET', '/api/shared/:token', (_, { token }) =>
      token === `share-${dinoParty.id.slice(0, 8)}`
        ? {
            body: {
              name: dinoParty.name,
              childName: 'Zuri',
              date: '2026-11-14',
              startsAt: '13:00',
              endsAt: '15:30',
              theme: 'Dino Dig',
              venue: 'Dino Den Play Café',
              coming: 11,
              plan: [
                'Venue: Dino Den Play Café',
                'Entertainer: Professor Fizz’s Volcano Lab',
                'Cake: Sweet Rex Bakery',
              ],
            },
          }
        : { status: 404, body: { status: 404, title: 'This link doesn’t work any more.' } },
    );
  }
}
