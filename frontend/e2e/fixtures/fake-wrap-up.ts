import { Request } from '@playwright/test';
import { FakeResponse } from './fake-planner';
import { dinoParty, zurisSixth } from './seed-data';

type Register = (
  method: string,
  path: string,
  handler: (request: Request, params: Record<string, string>) => FakeResponse,
) => void;

interface Note {
  guestId: string;
  childName: string;
  parentName: string;
  gift: string | null;
  /** The parent's own wording; null keeps the draft. */
  custom: string | null;
  sent: boolean;
  canSend: boolean;
}

interface Provider {
  providerId: string;
  name: string;
  category: string;
  stars: number | null;
  review: string | null;
}

const came: [string, string, string | null, boolean][] = [
  ['Arjun Patel', 'Priya Patel', 'Volcano science book', true],
  ['Ava Wilson', 'Jordan Wilson', 'Mermaid tail blanket', false],
  ['Ben Okoro', 'Ada Okoro', 'Sea creature puzzle', true],
  ['Chloe Tremblay', 'Marie Tremblay', 'Seashell craft kit', true],
  ['Ethan Wong', 'Grace Wong', 'Bath bombs', true],
  ['Hana Sato', 'Kenji Sato', 'Dolphin plush', true],
  ['Isla Murphy', 'Sean Murphy', null, true],
  ['Leo Rossi', 'Marco Rossi', null, true],
  ['Maya Chen', 'Lily Chen', 'Mermaid colouring set', true],
  ['Noor Ali', 'Sara Ali', 'Glitter tattoos', true],
  ['Omar Haddad', 'Rania Haddad', 'Underwater torch', true],
  ['Priya Singh', 'Anil Singh', 'Ocean storybook', true],
  ['Sofia Haddad', 'Rania Haddad', 'Pearl bracelet kit', true],
  ['Zoe Martin', 'Claire Martin', 'Snorkel set', true],
];

const draft = (first: string, gift: string | null) =>
  gift === null
    ? `Thank you so much for coming to my party, ${first}! It was so fun celebrating with you. Love, Zuri`
    : `Thank you so much for the ${gift}, ${first}! Zuri hasn’t put it down. It was so fun celebrating with you. Love, Zuri`;

const problem = (field: string, message: string) => ({
  status: 400,
  body: { status: 400, title: 'Some details need fixing.', errors: { [field]: [message] } },
});

/** Wrap-up after Zuri's 6th, and the saved plan it can become; Zuri's 7th hasn't happened yet. */
export class FakeWrapUp {
  notes: Note[] = came.map(([childName, parentName, gift, canSend], i) => ({
    guestId: `7a000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
    childName,
    parentName,
    gift,
    custom: null,
    sent: false,
    canSend,
  }));
  providers: Provider[] = [
    {
      providerId: 'b2000000-0000-4000-8000-000000000001',
      name: 'Splash & Giggle Pool',
      category: 'Venue',
      stars: null,
      review: null,
    },
    {
      providerId: 'b2000000-0000-4000-8000-000000000002',
      name: 'Coral the Singing Mermaid',
      category: 'Entertainer',
      stars: null,
      review: null,
    },
  ];
  template: { templateId: string; remindOn: string | null } | null = null;

  register(on: Register): void {
    on('GET', '/api/parties/:partyId/wrap-up', (_, { partyId }) => {
      if (partyId === dinoParty.id) return { body: this.upcoming() };
      if (partyId !== zurisSixth.id) return { status: 404 };
      return { body: this.view() };
    });
    on('PUT', '/api/parties/:partyId/thank-yous/:guestId', (request, { guestId }) => {
      const body = request.postDataJSON() as { gift: string | null; message: string | null };
      if (body.message !== null && !body.message.trim())
        return problem('message', 'Write a note, or keep Giddy’s draft');
      const note = this.notes.find((n) => n.guestId === guestId);
      if (!note) return { status: 404 };
      note.gift = body.gift?.trim() || null;
      note.custom = body.message?.trim() ?? null;
      return { status: 200 };
    });
    on('POST', '/api/parties/:partyId/thank-yous/send', () => {
      const due = this.notes.filter((n) => n.canSend && !n.sent);
      due.forEach((n) => (n.sent = true));
      return { body: { sent: due.length } };
    });
    on('PUT', '/api/parties/:partyId/ratings/:providerId', (request, { providerId }) => {
      const body = request.postDataJSON() as { stars: number; review?: string | null };
      if (!(body.stars >= 1 && body.stars <= 5)) return problem('stars', 'Choose 1 to 5 stars');
      const provider = this.providers.find((p) => p.providerId === providerId);
      if (!provider) return { status: 404 };
      provider.stars = body.stars;
      provider.review = body.review?.trim() || null;
      return { body: provider };
    });
    on('POST', '/api/parties/:partyId/template', () => {
      if (this.template) return { body: this.template };
      this.template = {
        templateId: '5e000000-0000-4000-8000-000000000001',
        remindOn: '2027-09-19',
      };
      return { status: 201, body: this.template };
    });
    on('GET', '/api/templates/:templateId', (_, { templateId }) =>
      this.template?.templateId === templateId
        ? {
            body: {
              templateId,
              name: zurisSixth.name,
              childId: '11111111-2222-4333-8444-000000000001',
              childName: 'Zuri',
              theme: 'Mermaid Splash',
            },
          }
        : { status: 404 },
    );
  }

  private view() {
    const notes = this.notes.map((n) => ({
      guestId: n.guestId,
      childName: n.childName,
      parentName: n.parentName,
      gift: n.gift,
      message: n.custom ?? draft(n.childName.split(' ')[0], n.gift),
      status: n.sent ? 'sent' : 'draft',
      canSend: n.canSend,
    }));
    return {
      open: true,
      opensOn: '2025-11-16',
      childName: 'Zuri',
      notes,
      providers: this.providers,
      numbers: {
        kidsCame: notes.length,
        invited: 16,
        spent: 702,
        budget: 720,
        gifts: this.notes.filter((n) => n.gift).length,
      },
      template: this.template,
    };
  }

  private upcoming() {
    return {
      open: false,
      opensOn: '2026-11-15',
      childName: 'Zuri',
      notes: [],
      providers: [],
      numbers: { kidsCame: 0, invited: 0, spent: 0, budget: 800, gifts: 0 },
      template: null,
    };
  }
}
