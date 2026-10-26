import { Request } from '@playwright/test';
import { FakeResponse } from './fake-planner';
import { SeedVenue, venues } from './seed-venues';

type Register = (
  method: string,
  path: string,
  handler: (request: Request, params: Record<string, string>) => FakeResponse,
) => void;

const money = (n: number) => `$${n.toLocaleString('en-CA')}`;

/** Venue search, details, favourites, the waitlist and comparisons, as the API answers them. */
export class FakeVenues {
  venues: SeedVenue[] = structuredClone(venues);
  favourites = new Set<string>();
  waitlist: { venueId: string; date: string }[] = [];
  /** The party's live booking at a venue; the booking store answers this. */
  liveBooking: (partyId: string | null, venueId: string) => unknown = () => null;
  /** Requests to GET /api/venues/search, newest last. */
  searches: URLSearchParams[] = [];

  register(on: Register): void {
    on('GET', '/api/venues/search', (request) => {
      const params = new URL(request.url()).searchParams;
      this.searches.push(params);
      return { body: this.search(params) };
    });
    on('GET', '/api/venues/compare', (request) => {
      const params = new URL(request.url()).searchParams;
      const ids = (params.get('ids') ?? '').split(',').filter(Boolean);
      if (ids.length < 2 || ids.length > 3)
        return { status: 400, body: { status: 400, title: 'Pick 2 or 3 venues to compare.' } };
      return {
        body: this.compare(
          ids.map((id) => this.venues.find((v) => v.id === id)!),
          params.get('date') ?? '',
        ),
      };
    });
    on('GET', '/api/venues/:venueId', (request, params) => {
      const venue = this.venues.find((v) => v.id === params['venueId']);
      const query = new URL(request.url()).searchParams;
      return venue
        ? { body: this.detail(venue, query.get('date') ?? '', query.get('partyId')) }
        : { status: 404 };
    });
    on('PUT', '/api/venues/:venueId/favourite', (request, params) => {
      const { favourite } = request.postDataJSON() as { favourite: boolean };
      if (favourite) this.favourites.add(params['venueId']);
      else this.favourites.delete(params['venueId']);
      return { status: 204 };
    });
    on('POST', '/api/venues/:venueId/waitlist', (request, params) => {
      const { date } = request.postDataJSON() as { date: string };
      this.waitlist.push({ venueId: params['venueId'], date });
      return { status: 202 };
    });
  }

  private search(params: URLSearchParams) {
    const guests = Number(params.get('guests'));
    const radius = Number(params.get('radiusKm') ?? 10);
    const maxPrice = params.get('maxPrice') ? Number(params.get('maxPrice')) : null;
    const flags = {
      nutFree: 'Nut-free kitchen',
      parking: 'Parking',
      stepFree: 'Step-free',
    } as const;
    const candidates = this.venues.filter(
      (v) => v.capacity >= guests - 2 && v.slots.some((s) => !s.booked),
    );
    const matches = (v: SeedVenue, price = maxPrice, r = radius, off: string | null = null) =>
      v.distanceKm <= r &&
      (price === null || v.price <= price) &&
      Object.entries(flags).every(
        ([key, feature]) =>
          key === off || params.get(key) !== 'true' || v.features.includes(feature),
      );
    const results = candidates.filter((v) => matches(v));
    const sort = params.get('sort') ?? 'best';
    results.sort((a, b) =>
      sort === 'closest'
        ? a.distanceKm - b.distanceKm
        : sort === 'price'
          ? a.price - b.price
          : sort === 'rating'
            ? b.rating - a.rating
            : b.rating * 2 -
              b.distanceKm * 0.3 -
              b.price / 200 -
              (a.rating * 2 - a.distanceKm * 0.3 - a.price / 200),
    );
    let noResults = null;
    if (!results.length) {
      const conflicts = [
        ...(maxPrice !== null ? [`under ${money(maxPrice)}`] : []),
        ...(params.get('nutFree') === 'true' ? ['with a nut-free kitchen'] : []),
        ...(params.get('parking') === 'true' ? ['with parking'] : []),
        ...(params.get('stepFree') === 'true' ? ['with step-free access'] : []),
      ];
      const cheapest = Math.min(...candidates.filter((v) => matches(v, null)).map((v) => v.price));
      noResults = {
        conflicts,
        suggestion:
          maxPrice !== null && Number.isFinite(cheapest)
            ? {
                label: `Raise to ${money(cheapest)}`,
                filter: 'maxPrice',
                value: String(cheapest),
                count: candidates.filter((v) => matches(v, cheapest)).length,
              }
            : null,
      };
    }
    return {
      area: 'Leslieville',
      radiusKm: radius,
      outsideServiceArea: false,
      results: results.map((v) => ({
        id: v.id,
        name: v.name,
        emoji: v.emoji,
        neighbourhood: v.neighbourhood,
        distanceKm: v.distanceKm,
        capacity: v.capacity,
        minAge: v.minAge,
        maxAge: v.maxAge,
        rating: v.rating,
        reviewCount: v.reviewCount,
        features: v.features,
        price: v.price,
        durationMinutes: v.durationMinutes,
        freeSlots: v.slots.filter((s) => !s.booked).map(({ start, end }) => ({ start, end })),
        fitWarning: v.capacity < guests ? `Fits ${v.capacity}; you invited ${guests}` : null,
      })),
      noResults,
    };
  }

  private detail(venue: SeedVenue, date: string, partyId: string | null) {
    const free = venue.slots.filter((s) => !s.booked);
    const fullyBooked = free.length === 0;
    return {
      id: venue.id,
      name: venue.name,
      emoji: venue.emoji,
      photoDescription: `the party room at ${venue.name}`,
      rating: venue.rating,
      reviewCount: venue.reviewCount,
      address: venue.address,
      neighbourhood: venue.neighbourhood,
      distanceKm: venue.distanceKm,
      description: `${venue.name} hosts birthday parties in ${venue.neighbourhood}.`,
      features: venue.features,
      price: venue.price,
      durationMinutes: venue.durationMinutes,
      capacity: venue.capacity,
      includes: ['The party room for the whole slot', 'Tables, chairs and clean-up'],
      addOns: [{ name: 'Dino egg hunt', price: '+$40' }],
      reviews: [
        {
          author: 'Rania H.',
          occasion: 'Sofia’s 6th',
          when: 'Sep 2026',
          rating: 5,
          text: 'Zero clean-up for us. Already booked for next year.',
        },
      ],
      date,
      slots: venue.slots,
      selectedSlot: free[0]?.start ?? null,
      fullyBooked,
      nearestFreeDate: fullyBooked ? { date: '2026-11-15', start: '10:00', end: '13:00' } : null,
      similarVenue: fullyBooked
        ? {
            id: this.venues[0].id,
            name: this.venues[0].name,
            distanceKm: 1.1,
            price: 340,
            start: '13:00',
          }
        : null,
      favourite: this.favourites.has(venue.id),
      room: venue.room ?? 'Party room',
      deposit: 100,
      freeCancellationUntil: new Date(Date.parse(`${date}T12:00:00Z`) - 14 * 86_400_000)
        .toISOString()
        .slice(0, 10),
      booking: this.liveBooking(partyId, venue.id),
    };
  }

  private compare(list: SeedVenue[], date: string) {
    const best = (values: number[], lower: boolean) => {
      const target = lower ? Math.min(...values) : Math.max(...values);
      return values.map((v) => v === target && values.filter((x) => x === target).length === 1);
    };
    const priceBest = best(
      list.map((v) => v.price),
      true,
    );
    const fitBest = best(
      list.map((v) => v.capacity),
      false,
    );
    const distanceBest = best(
      list.map((v) => v.distanceKm),
      true,
    );
    const ratingBest = best(
      list.map((v) => v.rating),
      false,
    );
    const row = (label: string, texts: string[], bests: boolean[] = texts.map(() => false)) => ({
      label,
      cells: texts.map((text, i) => ({ text, best: bests[i] })),
    });
    return {
      date,
      venues: list.map((v) => ({
        id: v.id,
        name: v.name,
        emoji: v.emoji,
        freeSlot: v.slots.find((s) => !s.booked)?.start ?? null,
      })),
      rows: [
        row(
          'Price',
          list.map((v) => `${money(v.price)} for ${v.durationMinutes / 60} h`),
          priceBest,
        ),
        row(
          'Free on the date',
          list.map((v) => `From ${v.slots.find((s) => !s.booked)?.start}`),
        ),
        row(
          'Fits',
          list.map((v) => `${v.capacity} kids`),
          fitBest,
        ),
        row(
          'Distance',
          list.map((v) => `${v.distanceKm.toFixed(1)} km`),
          distanceBest,
        ),
        row(
          'Rating',
          list.map((v) => `${v.rating.toFixed(1)} (${v.reviewCount})`),
          ratingBest,
        ),
        row(
          'Nut-free kitchen',
          list.map((v) => (v.features.includes('Nut-free kitchen') ? 'Yes' : 'No')),
        ),
        row(
          'Party host',
          list.map((v) => (v.partyHost ? 'Included' : 'Not included')),
        ),
        row(
          'Theme fit',
          list.map((v) => v.themeFit ?? '—'),
        ),
      ],
      recommendation: { venueId: list[0].id, name: list[0].name, reason: 'Cheapest and closest.' },
    };
  }
}
