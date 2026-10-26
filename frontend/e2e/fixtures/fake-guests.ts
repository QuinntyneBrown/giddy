import { Request } from '@playwright/test';
import { FakeResponse } from './fake-planner';
import { dinoParty, SeedSession } from './seed-data';
import { SeedGuest, seedGuests } from './seed-guests';

type Register = (
  method: string,
  path: string,
  handler: (request: Request, params: Record<string, string>) => FakeResponse,
) => void;

interface FakeInvitation {
  design: 'dino-green' | 'volcano' | 'fossil' | 'night-sky';
  headline: string;
  message: string;
  rsvpBy: string;
  askAllergies: boolean;
  askParentStaying: boolean;
  askSiblings: boolean;
  byEmail: boolean;
  byText: boolean;
  sentAt: string | null;
}

interface FakeLiveUpdate {
  id: number;
  partyId: string;
  guestId: string | null;
  kind: string;
  tone: string;
  title: string;
  text: string;
  action: { label: string; kind: string } | null;
}

const venue = 'Dino Den Play Café';
const notFound = {
  status: 404,
  body: {
    status: 404,
    title: 'This link no longer works. Ask the family who invited you to send it again.',
  },
};
const minusDays = (iso: string, days: number) =>
  new Date(Date.parse(`${iso}T12:00:00Z`) - days * 86_400_000).toISOString().slice(0, 10);
const firstName = (guest: SeedGuest) => guest.childName.split(' ')[0];
const familyName = (guest: SeedGuest) => `the ${guest.childName.split(' ').at(-1)} family`;

/** Guests, the invitation, private RSVP links, reminders and live updates, as the API answers them. */
export class FakeGuests {
  guests: SeedGuest[] = structuredClone(seedGuests);
  invitation: FakeInvitation = {
    design: 'dino-green',
    headline: 'Zuri is turning 7!',
    message:
      'Come celebrate with Zuri at a Dino Dig party! There will be games, cake and plenty of fun. Wear clothes that can get messy!',
    rsvpBy: '2026-11-06',
    askAllergies: true,
    askParentStaying: true,
    askSiblings: false,
    byEmail: true,
    byText: true,
    sentAt: '2026-10-20T14:00:00Z',
  };
  /** Bodies of PUT /api/parties/{id}/invitation, newest last. */
  saved: FakeInvitation[] = [];
  testsSent = 0;
  /** Guest ids of each reminder request, newest last. */
  reminders: string[][] = [];
  allergyListShares = 0;
  /** Bodies of PUT /api/rsvp/{token}, newest last. */
  replies: Record<string, unknown>[] = [];
  updates: FakeLiveUpdate[] = [];
  private readonly opened = new Set<string>();

  constructor(private readonly session: () => SeedSession | null) {}

  /** Before anything was sent: every family is "Not sent" and nobody has replied. */
  notInvitedYet(): void {
    this.invitation.sentAt = null;
    for (const guest of this.guests) {
      guest.rsvp = 'notSent';
      guest.allergies = null;
      guest.parentStaying = null;
    }
  }

  /** Something happens on the party while the host has Giddy open. */
  push(update: Omit<FakeLiveUpdate, 'id' | 'partyId'> & { partyId?: string }): void {
    this.updates.push({ partyId: dinoParty.id, ...update, id: this.updates.length + 1 });
  }

  register(on: Register): void {
    on('GET', '/api/parties/:partyId/guests', (_, params) => ({
      body: this.list(params['partyId']),
    }));
    on('POST', '/api/parties/:partyId/reminders', (request) => {
      const { guestIds } = request.postDataJSON() as { guestIds: string[] };
      this.reminders.push(guestIds);
      return { body: this.remind(guestIds) };
    });
    on('POST', '/api/parties/:partyId/allergy-list/share', () => {
      this.allergyListShares++;
      return { body: { venue, children: this.allergyList().length } };
    });
    on('GET', '/api/parties/:partyId/invitation', () => ({ body: this.invitationView() }));
    on('PUT', '/api/parties/:partyId/invitation', (request) => {
      const edit = request.postDataJSON() as FakeInvitation;
      const errors: Record<string, string[]> = {};
      if (edit.headline.length > 60) errors['headline'] = ['Keep the headline to 60 characters.'];
      if (edit.message.length > 280) errors['message'] = ['Keep the message to 280 characters.'];
      if (edit.rsvpBy >= dinoParty.date)
        errors['rsvpBy'] = ['Choose an RSVP-by date before the party.'];
      if (Object.keys(errors).length)
        return { status: 400, body: { status: 400, title: 'Some details need fixing.', errors } };
      this.saved.push(edit);
      this.invitation = { ...this.invitation, ...edit, sentAt: this.invitation.sentAt };
      return { body: this.invitationView() };
    });
    on('POST', '/api/parties/:partyId/invitation/test', () => {
      this.testsSent++;
      return { status: 202 };
    });
    on('POST', '/api/parties/:partyId/invitation/send', () => {
      if (!this.session()?.emailVerified)
        return {
          status: 403,
          body: {
            status: 403,
            title:
              'Verify your email before sending invitations, so families know they come from you.',
            code: 'email-unverified',
          },
        };
      const sending = this.guests.filter((g) => g.rsvp === 'notSent');
      sending.forEach((g) => (g.rsvp = 'waiting'));
      this.invitation.sentAt = '2026-10-25T20:00:00Z';
      return {
        body: {
          sent: sending.length,
          automaticReminderOn: minusDays(this.invitation.rsvpBy, 3),
        },
      };
    });
    on('GET', '/api/rsvp/:token', (_, params) => {
      const guest = this.guests.find((g) => g.token === params['token']);
      if (!guest) return notFound;
      if (!this.opened.has(guest.id)) {
        this.opened.add(guest.id);
        this.push({
          guestId: guest.id,
          kind: 'opened',
          tone: 'info',
          title: `${familyName(guest).replace(/^the/, 'The')} opened the invitation`,
          text: 'They haven’t replied yet.',
          action: null,
        });
      }
      return { body: this.rsvpView(guest) };
    });
    on('PUT', '/api/rsvp/:token', (request, params) => {
      const guest = this.guests.find((g) => g.token === params['token']);
      if (!guest) return notFound;
      const reply = request.postDataJSON() as {
        coming: boolean;
        allergies: string | null;
        parentStaying: boolean | null;
        parentName: string;
        mobile: string | null;
        note: string | null;
      };
      this.replies.push(reply);
      const errors: Record<string, string[]> = {};
      if (!reply.parentName?.trim())
        errors['parentName'] = ['Add your name so the family knows who replied.'];
      const digits = (reply.mobile ?? '').replace(/\D/g, '');
      if (digits && digits.length !== 10)
        errors['mobile'] = [
          'Enter a 10-digit mobile number, like 416-555-0177, or leave it blank.',
        ];
      if (Object.keys(errors).length)
        return { status: 400, body: { status: 400, title: 'Some details need fixing.', errors } };
      const changed = guest.rsvp === 'coming' || guest.rsvp === 'cantCome';
      guest.rsvp = reply.coming ? 'coming' : 'cantCome';
      guest.allergies = reply.allergies?.trim() || null;
      guest.parentStaying = reply.parentStaying;
      guest.parentName = reply.parentName.trim();
      guest.mobile = reply.mobile?.trim() || guest.mobile;
      guest.note = reply.note?.trim() || null;
      const coming = this.guests.filter((g) => g.rsvp === 'coming').length;
      this.push(
        changed
          ? {
              guestId: guest.id,
              kind: 'changed',
              tone: 'info',
              title: `${guest.parentName} changed their reply`,
              text: `${firstName(guest)} ${reply.coming ? 'is coming' : 'can’t come'} now.`,
              action: { label: 'View guests', kind: 'view-guests' },
            }
          : {
              guestId: guest.id,
              kind: 'replied',
              tone: reply.coming ? 'success' : 'info',
              title: reply.coming
                ? `${firstName(guest)} is coming!`
                : `${firstName(guest)} can’t come`,
              text: `${guest.parentName} replied. ${coming} coming so far.`,
              action: { label: 'View guests', kind: 'view-guests' },
            },
      );
      return { body: this.rsvpView(guest) };
    });
    on('GET', '/api/live-updates', (request) => {
      const after = new URL(request.url()).searchParams.get('after');
      if (after === null) return { body: { events: [], cursor: this.updates.length } };
      const events = this.updates.filter((u) => u.id > Number(after));
      return { body: { events, cursor: events.at(-1)?.id ?? Number(after) } };
    });
  }

  private list(partyId: string) {
    const guests = partyId === dinoParty.id ? this.guests : [];
    const count = (rsvp: SeedGuest['rsvp']) => guests.filter((g) => g.rsvp === rsvp).length;
    return {
      guests: [...guests]
        .sort((a, b) => a.childName.localeCompare(b.childName))
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ token, ...g }) => ({
          ...g,
          hasEmail: g.email !== null,
          hasMobile: g.mobile !== null,
        })),
      counts: {
        invited: guests.length,
        coming: count('coming'),
        waiting: count('waiting'),
        cantCome: count('cantCome'),
        notSent: count('notSent'),
      },
      allergyList: partyId === dinoParty.id ? this.allergyList() : [],
    };
  }

  private allergyList() {
    return this.guests
      .filter((g) => g.allergies && g.rsvp !== 'cantCome')
      .sort((a, b) => a.childName.localeCompare(b.childName))
      .map((g) => ({ child: firstName(g), allergy: g.allergies! }));
  }

  private remind(guestIds: string[]) {
    const now = Date.now();
    const result = {
      reminded: [] as string[],
      skipped: [] as { guestId: string; child: string; reason: string }[],
      undeliverable: [] as { guestId: string; child: string; reason: string }[],
    };
    for (const guest of this.guests.filter((g) => guestIds.includes(g.id))) {
      const outcome = { guestId: guest.id, child: firstName(guest) };
      if (guest.rsvp === 'coming' || guest.rsvp === 'cantCome') {
        result.skipped.push({ ...outcome, reason: 'Already replied' });
      } else if (guest.lastRemindedAt && now - Date.parse(guest.lastRemindedAt) < 48 * 3_600_000) {
        result.skipped.push({ ...outcome, reason: 'Reminded less than 48 hours ago' });
      } else if ((!guest.email || guest.emailBounced) && !guest.mobile) {
        result.undeliverable.push({
          ...outcome,
          reason: guest.emailBounced
            ? 'The email bounced and there’s no mobile number'
            : 'No email or mobile number',
        });
      } else {
        guest.lastRemindedAt = new Date(now).toISOString();
        result.reminded.push(firstName(guest));
      }
    }
    return result;
  }

  private details() {
    return {
      childName: 'Zuri',
      date: dinoParty.date,
      startsAt: '13:00',
      endsAt: '15:30',
      place: `${venue}, 1124 Queen St E`,
      hostName: 'Amara Okafor',
    };
  }

  private invitationView() {
    return {
      ...this.invitation,
      families: this.guests.length,
      emailReach: this.guests.filter((g) => g.email).length,
      textReach: this.guests.filter((g) => g.mobile).length,
      notSent: this.guests.filter((g) => g.rsvp === 'notSent').length,
      details: this.details(),
      automaticReminderOn: minusDays(this.invitation.rsvpBy, 3),
    };
  }

  private rsvpView(guest: SeedGuest) {
    return {
      invitation: {
        design: this.invitation.design,
        headline: this.invitation.headline,
        message: this.invitation.message,
        rsvpBy: this.invitation.rsvpBy,
        details: this.details(),
      },
      guest: {
        childFirstName: firstName(guest),
        familyName: familyName(guest),
        parentName: guest.parentName,
        rsvp: guest.rsvp,
        allergies: guest.allergies,
        parentStaying: guest.parentStaying,
        siblings: null,
        mobile: guest.mobile,
        note: guest.note,
      },
      questions: {
        allergies: this.invitation.askAllergies,
        parentStaying: this.invitation.askParentStaying,
        siblings: this.invitation.askSiblings,
      },
      canChange: true,
    };
  }
}
