/** In-memory data the fake API serves. Shapes follow the real API contracts. */
export interface SeedSession {
  parentId: string;
  name: string;
  email: string;
}

export interface SeedParty {
  id: string;
  name: string;
  date: string;
  startsAt: string;
  endsAt: string;
  role: 'owner' | 'coPlanner' | 'viewer';
  daysToGo: number;
}

export const amara: SeedSession = {
  parentId: '6f1c2a52-8a51-4a5e-9d0e-2f8f0a1b3c01',
  name: 'Amara Okafor',
  email: 'amara.okafor@example.com',
};

export const dinoParty: SeedParty = {
  id: '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6',
  name: 'Zuri’s Dino Dig 7th',
  date: '2026-11-14',
  startsAt: '13:00',
  endsAt: '15:30',
  role: 'owner',
  daysToGo: 20,
};

export const xsrfToken = 'fake-xsrf-token';

export interface SeedToolStep {
  text: string;
  done: boolean;
}

export interface SeedProposalItem {
  category: string;
  catalogueItemId: string;
  name: string;
  detail: string;
  price: number;
  allergyNote: string | null;
}

export interface SeedProposal {
  id: string;
  title: string;
  theme: { name: string; detail: string };
  items: SeedProposalItem[];
  total: number;
  budget: number | null;
  overBudgetBy: number;
  applied: boolean;
}

export interface SeedMessage {
  id: string;
  author: 'parent' | 'giddy';
  text: string;
  sentAt: string;
  steps: SeedToolStep[];
  suggestions: string[];
  proposal: SeedProposal | null;
}

export interface SeedMemory {
  id: string;
  text: string;
}

export const dinoGlance = {
  partyId: dinoParty.id,
  name: dinoParty.name,
  childName: 'Zuri',
  turningAge: 7,
  who: 'Zuri, turning 7',
  date: '2026-11-14',
  timeOfDay: 'afternoon',
  area: 'Leslieville',
  radiusKm: 8,
  guests: 15,
  budget: 800,
};

export const remembered: SeedMemory[] = [
  { id: '9a1f0c2e-1111-4a2b-8c3d-000000000001', text: 'Zuri loves dinosaurs, digging and science' },
  {
    id: '9a1f0c2e-1111-4a2b-8c3d-000000000002',
    text: 'Hana is gluten-free, Arjun has a peanut allergy',
  },
  { id: '9a1f0c2e-1111-4a2b-8c3d-000000000003', text: 'You prefer venues with parking' },
];

export const dinoPlan: SeedProposal = {
  id: '7c2e9d40-2222-4b3c-9d4e-000000000001',
  title: 'Zuri’s Dino Dig 7th',
  theme: { name: 'Dino Dig', detail: 'Fossil hunt, volcano science, dino eggs' },
  items: [
    {
      category: 'Venue',
      catalogueItemId: 'b1000000-0000-4000-8000-000000000001',
      name: 'Dino Den Play Café',
      detail: '1:00–3:30 pm · up to 20 kids · nut-free kitchen',
      price: 340,
      allergyNote: null,
    },
    {
      category: 'Entertainer',
      catalogueItemId: 'c1000000-0000-4000-8000-000000000001',
      name: 'Professor Fizz’s Volcano Lab',
      detail: '45 min show',
      price: 195,
      allergyNote: null,
    },
    {
      category: 'Cake',
      catalogueItemId: 'd1000000-0000-4000-8000-000000000001',
      name: 'Sweet Rex Bakery',
      detail: 'nut-free dino cake for 20',
      price: 85,
      allergyNote: null,
    },
    {
      category: 'Food',
      catalogueItemId: 'e1000000-0000-4000-8000-000000000001',
      name: 'Pizza Nonna',
      detail: '6 large pizzas and juice boxes',
      price: 110,
      allergyNote: null,
    },
    {
      category: 'Loot bags',
      catalogueItemId: 'f1000000-0000-4000-8000-000000000001',
      name: 'Mini fossil dig kits',
      detail: 'Mini fossil dig kits × 16',
      price: 48,
      allergyNote: null,
    },
  ],
  total: 778,
  budget: 800,
  overBudgetBy: 0,
  applied: false,
};

export const planSteps = [
  'Checked 38 venues within 8 km for Sat 14 Nov afternoon',
  'Compared 12 entertainers for dinosaurs',
  'Found 4 bakeries with peanut-free cakes',
];
