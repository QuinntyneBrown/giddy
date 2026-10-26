import { Request } from '@playwright/test';
import { FakeResponse } from './fake-planner';

type Register = (
  method: string,
  path: string,
  handler: (request: Request, params: Record<string, string>) => FakeResponse,
) => void;

type Category = 'entertainers' | 'activities' | 'food' | 'rentals';

export interface SeedVendor {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: Category;
  planCategory: string;
  price: number;
  priceBasis: string;
  rating: number;
  reviewCount: number;
  durationMinutes: number | null;
  minAge: number | null;
  maxAge: number | null;
  noticeDays: number | null;
  /** Allergens the vendor is free of. */
  freeOf: string[];
  vegan: boolean;
  dino: boolean;
}

const vendor = (
  v: Partial<SeedVendor> & Pick<SeedVendor, 'id' | 'name' | 'emoji' | 'category' | 'price'>,
): SeedVendor => ({
  description: `${v.name} for kids’ parties.`,
  planCategory: v.category === 'food' ? 'Food' : 'Entertainer',
  priceBasis: '',
  rating: 4.6,
  reviewCount: 50,
  durationMinutes: null,
  minAge: null,
  maxAge: null,
  noticeDays: null,
  freeOf: [],
  vegan: false,
  dino: false,
  ...v,
});

/** Matches the API's demo catalogue. */
export const seedVendors: SeedVendor[] = [
  vendor({
    id: 'c1000000-0000-4000-8000-000000000001',
    name: 'Professor Fizz’s Volcano Lab',
    emoji: '🧪',
    category: 'entertainers',
    price: 195,
    rating: 4.9,
    reviewCount: 187,
    durationMinutes: 45,
    minAge: 4,
    maxAge: 10,
    dino: true,
    description: 'Hands-on science show with erupting volcanoes.',
  }),
  vendor({
    id: 'c1000000-0000-4000-8000-000000000003',
    name: 'Rexy the Dino Visit',
    emoji: '🦖',
    category: 'entertainers',
    price: 150,
    rating: 4.7,
    reviewCount: 64,
    durationMinutes: 30,
    minAge: 2,
    maxAge: 8,
    dino: true,
    description: 'A friendly costumed T. rex for photos and a dino dance.',
  }),
  vendor({
    id: 'c1000000-0000-4000-8000-000000000002',
    name: 'Dino Dan’s Fossil Show',
    emoji: '🦕',
    category: 'entertainers',
    price: 240,
    rating: 4.6,
    reviewCount: 98,
    durationMinutes: 60,
    minAge: 4,
    maxAge: 9,
    dino: true,
    description: 'Life-size dino puppets and a fossil dig.',
  }),
  vendor({
    id: 'c1000000-0000-4000-8000-000000000005',
    name: 'DJ Dance Party Dan',
    emoji: '🎶',
    category: 'entertainers',
    price: 240,
    rating: 4.5,
    reviewCount: 77,
    durationMinutes: 90,
    minAge: 5,
    maxAge: 12,
    description: 'Kid-friendly DJ with freeze-dance games.',
  }),
  vendor({
    id: 'a3000000-0000-4000-8000-000000000001',
    name: 'Paint Pals Face Painting',
    emoji: '🎨',
    category: 'activities',
    price: 180,
    rating: 4.8,
    reviewCount: 230,
    durationMinutes: 120,
    dino: true,
    description: 'Two artists, dino and glitter designs.',
  }),
  vendor({
    id: 'd1000000-0000-4000-8000-000000000001',
    name: 'Sweet Rex Bakery',
    emoji: '🎂',
    category: 'food',
    planCategory: 'Cake',
    price: 85,
    rating: 4.9,
    reviewCount: 321,
    noticeDays: 5,
    freeOf: ['peanut', 'tree nut'],
    dino: true,
    description: 'Custom dino cakes; nut-free bakery.',
  }),
  vendor({
    id: 'd1000000-0000-4000-8000-000000000003',
    name: 'Cupcake Cloud',
    emoji: '🧁',
    category: 'food',
    planCategory: 'Cake',
    price: 72,
    rating: 4.8,
    reviewCount: 199,
    noticeDays: 2,
    freeOf: ['dairy', 'egg'],
    vegan: true,
    dino: true,
    description: '24 mini cupcakes with dino toppers, vegan option.',
  }),
  vendor({
    id: 'd1000000-0000-4000-8000-000000000002',
    name: 'Cake Corner',
    emoji: '🍰',
    category: 'food',
    planCategory: 'Cake',
    price: 70,
    rating: 4.3,
    reviewCount: 55,
    noticeDays: 3,
    description: 'Classic buttercream cakes.',
  }),
  vendor({
    id: 'e1000000-0000-4000-8000-000000000004',
    name: 'Popsicle Parade',
    emoji: '🍦',
    category: 'food',
    price: 40,
    rating: 4.5,
    reviewCount: 61,
    noticeDays: 1,
    freeOf: ['dairy', 'peanut', 'tree nut'],
    description: 'Fruit popsicles, dairy-free and nut-free.',
  }),
];

const canonical = (note: string) => {
  const text = note.toLowerCase();
  if (text.includes('peanut')) return 'peanut';
  if (/dairy|milk|lactose/.test(text)) return 'dairy';
  if (/gluten|celiac|wheat/.test(text)) return 'gluten';
  return text;
};

/** Fun & food search and quote requests, as the API answers them. */
export class FakeVendors {
  vendors = structuredClone(seedVendors);
  /** Vendor ids with a pending quote request. */
  pending = new Set<string>();
  /** Bodies of POST /api/parties/{id}/quotes, newest last. */
  quoteRequests: Record<string, unknown>[] = [];
  confirmed: string[] = [];
  /** The party's theme, or null when it has none. */
  theme: string | null = 'Dino Dig';
  /** Whether the venue is booked, so quotes must start during the booking (1:00–3:30 pm). */
  venueBooked = true;

  constructor(
    private readonly allergies: () => { child: string; note: string }[],
    private readonly planStatus: (name: string) => string | null,
    private readonly addToPlan: (vendor: SeedVendor) => void,
  ) {}

  register(on: Register): void {
    on('GET', '/api/vendors/search', (request) => {
      const params = new URL(request.url()).searchParams;
      return { body: this.search(params) };
    });
    on('POST', '/api/parties/:partyId/quotes', (request) => {
      const body = request.postDataJSON() as { vendorId: string; start: string; kids: number };
      this.quoteRequests.push(body);
      const vendor = this.vendors.find((v) => v.id === body.vendorId);
      if (!vendor) return { status: 404 };
      if (this.venueBooked && (body.start < '13:00' || body.start >= '15:30'))
        return {
          status: 400,
          body: {
            status: 400,
            title: 'Some details need fixing.',
            errors: {
              start: ['Choose a start time between 1:00 and 3:30 pm, while you have the venue.'],
            },
          },
        };
      if (this.pending.has(vendor.id))
        return {
          status: 409,
          body: {
            status: 409,
            title: `You asked ${vendor.name} for a quote less than a day ago, so a request is pending.`,
          },
        };
      this.pending.add(vendor.id);
      this.addToPlan(vendor);
      return {
        status: 201,
        body: {
          id: `q-${vendor.id}`,
          vendorId: vendor.id,
          vendorName: vendor.name,
          status: 'requested',
          replyTime: `${vendor.name} usually replies within a day.`,
        },
      };
    });
    on('POST', '/api/parties/:partyId/quotes/:quoteId/confirm', (_, params) => {
      this.confirmed.push(params['quoteId']);
      return { status: 204 };
    });
  }

  private search(params: URLSearchParams) {
    const category = (params.get('category') ?? 'entertainers') as Category;
    const themeOn = this.theme !== null && params.get('theme') !== 'off';
    const maxPrice = params.get('maxPrice') ? Number(params.get('maxPrice')) : null;
    const inCategory = this.vendors.filter((v) => v.category === category);
    const themed = inCategory.filter((v) => !themeOn || v.dino);
    const results = themed.filter((v) => maxPrice === null || v.price <= maxPrice);
    const groups = new Map<string, string[]>();
    for (const { child, note } of this.allergies()) {
      const key = canonical(note);
      groups.set(key, [...(groups.get(key) ?? []), child]);
    }
    const allergies = [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([allergen, children]) => ({ allergen, children: children.sort() }));
    return {
      category,
      date: '2026-11-14',
      place: category === 'food' ? 'Dino Den Play Café' : 'Leslieville',
      theme: this.theme,
      themeOn,
      results: results.map((v) => ({
        id: v.id,
        name: v.name,
        emoji: v.emoji,
        description: v.description,
        category: v.planCategory,
        neighbourhood: 'Leslieville',
        price: v.price,
        priceBasis: v.priceBasis,
        rating: v.rating,
        reviewCount: v.reviewCount,
        durationMinutes: v.durationMinutes,
        minAge: v.minAge,
        maxAge: v.maxAge,
        noticeDays: v.noticeDays,
        dietary: [
          ...(['peanut', 'tree nut'].every((a) => v.freeOf.includes(a)) ? ['nut-free'] : []),
          ...(v.freeOf.includes('gluten') ? ['gluten-free'] : []),
          ...(v.freeOf.includes('dairy') ? ['dairy-free'] : []),
          ...(v.vegan ? ['vegan'] : []),
        ],
        // Like the API, only food is checked against the allergies.
        allergyFit:
          category === 'food'
            ? allergies.map((a) => ({ allergen: a.allergen, ok: v.freeOf.includes(a.allergen) }))
            : [],
        planStatus: this.planStatus(v.name),
      })),
      allergies: category === 'food' ? allergies : [],
      noResults: results.length
        ? null
        : {
            conflicts: [
              ...(maxPrice !== null ? [`under $${maxPrice}`] : []),
              ...(themeOn ? [`for the ${this.theme} theme`] : []),
            ],
            suggestion:
              maxPrice !== null && themed.length
                ? {
                    label: `Raise to $${Math.min(...themed.map((v) => v.price))}`,
                    filter: 'maxPrice',
                    value: String(Math.min(...themed.map((v) => v.price))),
                  }
                : themeOn
                  ? { label: 'Show every theme', filter: 'theme', value: 'off' }
                  : null,
          },
    };
  }
}
