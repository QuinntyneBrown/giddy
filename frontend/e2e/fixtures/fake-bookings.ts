import { Request } from '@playwright/test';
import { FakeResponse } from './fake-planner';
import { SeedVenue } from './seed-venues';

type Register = (
  method: string,
  path: string,
  handler: (request: Request, params: Record<string, string>) => FakeResponse,
) => void;

interface BookRequest {
  venueId: string;
  date: string;
  start: string;
  bookingName: string;
  mobile: string;
  child: string;
  notes: string | null;
  payment: { token: string | null; savedCardId: string | null; saveCard: boolean };
}

export interface FakeBooking {
  id: string;
  partyId: string;
  venueId: string;
  venueName: string;
  date: string;
  start: string;
  end: string;
  room: string;
  capacity: number;
  contact: string | null;
  state: 'holding' | 'confirmed' | 'declined' | 'released' | 'cancelled';
  confirmationNumber: string | null;
  price: number;
  deposit: number;
  balance: number;
  card: { brand: string; last4: string } | null;
  freeCancellationUntil: string;
  refundable: boolean;
  holdExpiresAt: string;
  challengeUrl: string | null;
}

const cards: Record<string, { brand: string; last4: string }> = {
  tok_visa: { brand: 'Visa', last4: '4242' },
  tok_mastercard: { brand: 'Mastercard', last4: '4444' },
  tok_declined: { brand: 'Visa', last4: '0002' },
  tok_3ds: { brand: 'Visa', last4: '3184' },
};

const time = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
};
const range = (start: string, end: string) =>
  Number(start.slice(0, 2)) < 12 === Number(end.slice(0, 2)) < 12
    ? `${time(start).slice(0, -3)}–${time(end)}`
    : `${time(start)}–${time(end)}`;
const day = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
const minusDays = (iso: string, days: number) =>
  new Date(Date.parse(`${iso}T12:00:00Z`) - days * 86_400_000).toISOString().slice(0, 10);

/** Venue bookings, deposits, saved cards and booking notices, as the API answers them. */
export class FakeBookings {
  bookings: FakeBooking[] = [];
  savedCards = [
    { id: 'c1000000-0000-4000-8000-000000000001', brand: 'Visa', last4: '4242', token: 'tok_visa' },
  ];
  /** Bodies of POST /api/parties/{id}/bookings, newest last. */
  requests: BookRequest[] = [];
  /** Slots another family books while the dialog is open, as "venueId@start". */
  takenByOthers = new Set<string>();
  /** The venue does not confirm in time. */
  venueTimesOut = false;
  /** Transit and city notices near the venue on the party day. */
  disruptions: { title: string; text: string }[] = [];
  /** How long booking takes to answer. */
  delayMs = 0;
  /** Whether cancelling refunds the deposit (inside the free-cancellation window). */
  refundable = true;
  private nextConfirmation = 48213;

  constructor(private readonly venues: () => SeedVenue[]) {}

  register(on: Register): void {
    on('POST', '/api/parties/:partyId/bookings', (request, params) => ({
      ...this.book(params['partyId'], request.postDataJSON() as BookRequest),
      delayMs: this.delayMs,
    }));
    on('POST', '/api/parties/:partyId/bookings/:bookingId/authentication', (_, params) => {
      const booking = this.bookings.find((b) => b.id === params['bookingId']);
      if (!booking || booking.partyId !== params['partyId']) return { status: 404 };
      this.confirm(booking);
      return { body: booking };
    });
    on('POST', '/api/parties/:partyId/bookings/:bookingId/cancel', (_, params) => {
      const booking = this.bookings.find((b) => b.id === params['bookingId']);
      if (!booking) return { status: 404 };
      booking.state = 'cancelled';
      this.slot(booking).booked = false;
      return { body: { refunded: this.refundable, amount: booking.deposit } };
    });
    on('GET', '/api/parties/:partyId/booking-notices', (_, params) => ({
      body: this.notices(params['partyId']),
    }));
    on('GET', '/api/payment-methods', () => ({
      body: this.savedCards.map(({ id, brand, last4 }) => ({ id, brand, last4 })),
    }));
  }

  /** The party's live booking at a venue, for the venue page. */
  liveBooking(partyId: string | null, venueId: string): FakeBooking | null {
    return (
      this.bookings
        .filter(
          (b) =>
            b.partyId === partyId &&
            b.venueId === venueId &&
            (b.state === 'confirmed' || b.state === 'holding'),
        )
        .at(-1) ?? null
    );
  }

  /** Seeds a booking as if it had been made earlier. */
  seed(partyId: string, state: FakeBooking['state'], token = 'tok_visa'): FakeBooking {
    const venue = this.venues()[0];
    const booking = this.create(partyId, venue, '2026-11-14', '13:00', token);
    booking.state = state;
    if (state === 'confirmed') this.confirm(booking);
    if (state === 'holding') booking.challengeUrl = 'sandbox://3ds/pi_seeded';
    return booking;
  }

  private book(partyId: string, body: BookRequest): FakeResponse {
    this.requests.push(body);
    const errors: Record<string, string[]> = {};
    const digits = body.mobile.replace(/\D/g, '');
    if (!digits) errors['mobile'] = ['Add a mobile number so the venue can reach you on the day.'];
    else if (digits.length !== 10)
      errors['mobile'] = ['Enter a 10-digit mobile number, like 416-555-0188.'];
    if (Object.keys(errors).length)
      return { status: 400, body: { status: 400, title: 'Some details need fixing.', errors } };

    const venue = this.venues().find((v) => v.id === body.venueId);
    if (!venue) return { status: 404 };
    const slot = venue.slots.find((s) => s.start === body.start)!;
    if (slot.booked || this.takenByOthers.has(`${venue.id}@${body.start}`)) {
      return {
        status: 409,
        body: {
          status: 409,
          title: `${time(body.start)} at ${venue.name} is no longer free, so nothing was charged.`,
          alternatives: venue.slots
            .filter(
              (s) =>
                !s.booked &&
                s.start !== body.start &&
                !this.takenByOthers.has(`${venue.id}@${s.start}`),
            )
            .map((s) => ({ venueId: venue.id, venueName: venue.name, start: s.start, end: s.end })),
        },
      };
    }

    const token =
      body.payment.token ?? this.savedCards.find((c) => c.id === body.payment.savedCardId)?.token;
    if (!token) return { status: 404 };
    const booking = this.create(partyId, venue, body.date, body.start, token);
    if (token === 'tok_declined') {
      booking.state = 'declined';
      return {
        status: 402,
        body: {
          status: 402,
          title: 'Visa ending 0002 was declined, so nothing was charged. Try another card.',
        },
      };
    }
    if (this.venueTimesOut) {
      booking.state = 'released';
      return {
        status: 502,
        body: {
          status: 502,
          title: `${venue.name} didn’t confirm in time, so nothing was charged. Try again in a moment.`,
        },
      };
    }
    if (body.payment.saveCard && body.payment.token) {
      this.savedCards.push({ id: `c-${this.savedCards.length + 1}`, ...cards[token], token });
    }
    if (token === 'tok_3ds') {
      booking.challengeUrl = `sandbox://3ds/pi_${booking.id}`;
      return { status: 202, body: booking };
    }
    this.confirm(booking);
    return { status: 201, body: booking };
  }

  private create(
    partyId: string,
    venue: SeedVenue,
    date: string,
    start: string,
    token: string,
  ): FakeBooking {
    const slot = venue.slots.find((s) => s.start === start)!;
    const booking: FakeBooking = {
      id: `b0000000-0000-4000-8000-${String(this.bookings.length + 1).padStart(12, '0')}`,
      partyId,
      venueId: venue.id,
      venueName: venue.name,
      date,
      start,
      end: slot.end,
      room: venue.room ?? 'Party room',
      capacity: venue.capacity,
      contact: venue.contact ?? null,
      state: 'holding',
      confirmationNumber: null,
      price: venue.price,
      deposit: 100,
      balance: venue.price - 100,
      card: cards[token] ?? null,
      freeCancellationUntil: minusDays(date, 14),
      refundable: this.refundable,
      holdExpiresAt: '2026-10-27T20:00:00Z',
      challengeUrl: null,
    };
    this.bookings.push(booking);
    return booking;
  }

  private confirm(booking: FakeBooking): void {
    booking.state = 'confirmed';
    booking.challengeUrl = null;
    booking.confirmationNumber = `DD-${this.nextConfirmation++}`;
    booking.refundable = this.refundable;
    this.slot(booking).booked = true;
  }

  private slot(booking: FakeBooking) {
    return this.venues()
      .find((v) => v.id === booking.venueId)!
      .slots.find((s) => s.start === booking.start)!;
  }

  private notices(partyId: string) {
    const latest = this.bookings.filter((b) => b.partyId === partyId).at(-1);
    if (!latest) return [];
    const base = { bookingId: latest.id, venueId: latest.venueId };
    switch (latest.state) {
      case 'holding':
        return [
          {
            ...base,
            kind: 'hold',
            tone: 'info',
            title: `${latest.venueName} is holding ${time(latest.start)} for you`,
            text: `The hold lasts until Tue 27 Oct, 4:00 pm. Pay the $${latest.deposit} deposit to lock it in.`,
            dismissible: true,
          },
        ];
      case 'confirmed':
        return [
          {
            ...base,
            kind: 'confirmed',
            tone: 'success',
            title: `${latest.venueName} confirmed your booking`,
            text: `${day(latest.date)}, ${range(latest.start, latest.end)} · confirmation ${latest.confirmationNumber}.`,
            dismissible: true,
          },
          ...this.disruptions.map((d) => ({
            ...base,
            kind: 'disruption',
            tone: 'warning',
            title: d.title,
            text: d.text,
            dismissible: false,
          })),
        ];
      case 'declined':
        return [
          {
            ...base,
            kind: 'declined',
            tone: 'danger',
            title: 'Your deposit payment didn’t go through',
            text: `${latest.card?.brand} ending ${latest.card?.last4} was declined, so ${latest.venueName} released the hold. The ${time(latest.start)} slot is still free right now.`,
            dismissible: false,
          },
        ];
      default:
        return [];
    }
  }
}
