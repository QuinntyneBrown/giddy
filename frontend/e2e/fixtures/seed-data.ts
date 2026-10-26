/** In-memory data the fake API serves. Shapes follow the real API contracts. */
export interface SeedSession {
  parentId: string;
  name: string;
  email: string;
  emailVerified: boolean;
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
  emailVerified: true,
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

export interface SeedChild {
  id: string;
  firstName: string;
  birthday: string;
  nextBirthday: string;
  turningAge: number;
}

export const family = {
  postalCode: 'M4M 1H1',
  areaName: 'Leslieville',
  children: [
    {
      id: '11111111-2222-4333-8444-000000000001',
      firstName: 'Zuri',
      birthday: '2019-11-14',
      nextBirthday: '2026-11-14',
      turningAge: 7,
    },
    {
      id: '11111111-2222-4333-8444-000000000002',
      firstName: 'Kofi',
      birthday: '2023-02-03',
      nextBirthday: '2027-02-03',
      turningAge: 4,
    },
  ] as SeedChild[],
};

export interface SeedSummary extends SeedParty {
  status: 'upcoming' | 'draft' | 'past';
  readiness: number;
  venueName: string | null;
  theme: string | null;
  locked: boolean;
  guests: number | null;
  budget: number | null;
}

export const plannedDino: SeedSummary = {
  ...dinoParty,
  status: 'upcoming',
  readiness: 27,
  venueName: 'Dino Den Play Café',
  theme: 'Dino Dig',
  locked: false,
  guests: 16,
  budget: 800,
};

export const kofisDraft: SeedSummary = {
  id: '4b0c2d3e-5f60-4718-9a2b-3c4d5e6f7a80',
  name: 'Kofi’s 4th: Choo-Choo Express',
  date: '2027-02-03',
  startsAt: '10:00',
  endsAt: '12:00',
  role: 'owner',
  daysToGo: 101,
  status: 'draft',
  readiness: 0,
  venueName: null,
  theme: 'Choo-Choo Express',
  locked: false,
  guests: 12,
  budget: 500,
};

export const zurisSixth: SeedSummary = {
  id: '6d1e2f30-4152-4637-8849-5a6b7c8d9e01',
  name: 'Zuri’s 6th: Mermaid Splash',
  date: '2025-11-15',
  startsAt: '13:00',
  endsAt: '15:00',
  role: 'owner',
  daysToGo: -344,
  status: 'past',
  readiness: 100,
  venueName: 'Splash & Giggle Pool',
  theme: 'Mermaid Splash',
  locked: true,
  guests: 14,
  budget: 720,
};

export function overviewOf(party: SeedSummary) {
  const planned = party.status !== 'draft';
  return {
    id: party.id,
    name: party.name,
    date: party.date,
    startsAt: party.startsAt,
    endsAt: party.endsAt,
    timeOfDay: 'afternoon',
    daysToGo: party.daysToGo,
    childName: party.id === kofisDraft.id ? 'Kofi' : 'Zuri',
    turningAge: party.id === kofisDraft.id ? 4 : 7,
    area: 'Leslieville',
    venueName: party.venueName,
    theme: party.theme,
    guests: party.guests,
    readiness: party.readiness,
    doneTasks: planned ? 3 : 0,
    totalTasks: planned ? 10 : 0,
    nextTasks: planned
      ? [
          { title: 'Book the entertainer', due: '2026-10-20', overdue: true },
          { title: 'Order the cake', due: '2026-10-31', overdue: false },
          { title: 'Share the allergy list with the venue', due: '2026-11-04', overdue: false },
        ]
      : [],
    nextStep: planned ? 'Book Professor Fizz’s Volcano Lab' : null,
    allergies: ['peanut'],
    budget: party.budget,
    planned: planned ? 778 : 0,
    rsvps: { coming: 0, waiting: 0, cantCome: 0 },
    members: [
      { parentId: amara.parentId, name: 'Amara Okafor', role: 'owner', isYou: true },
      {
        parentId: '0b7f6d1e-3c2a-4b8e-a1f0-5d6c7e8f9a02',
        name: 'Kemi Okafor',
        role: 'coPlanner',
        isYou: false,
      },
    ],
    role: party.role,
    canDelete: party.role === 'owner',
    locked: party.locked,
  };
}

export const dinoBookings = [
  { category: 'Venue', name: 'Dino Den Play Café', price: 340, status: 'confirmed', paid: 100 },
  {
    category: 'Entertainer',
    name: 'Professor Fizz’s Volcano Lab',
    price: 195,
    status: 'toBook',
    paid: 0,
  },
  { category: 'Cake', name: 'Sweet Rex Bakery', price: 85, status: 'toBook', paid: 0 },
  { category: 'Food', name: 'Pizza Nonna', price: 110, status: 'toBook', paid: 0 },
  { category: 'Loot bags', name: 'Mini fossil dig kits', price: 48, status: 'toBook', paid: 0 },
];

export const homeNudges = [
  {
    partyId: dinoParty.id,
    partyName: dinoParty.name,
    title: 'Book the entertainer',
    kind: 'overdue',
    context: 'It was due Tue 20 Oct.',
    actionLabel: 'Open the plan',
  },
  {
    partyId: dinoParty.id,
    partyName: dinoParty.name,
    title: 'Order the cake',
    kind: 'needsYou',
    context: 'Due Sat 31 Oct.',
    actionLabel: 'Open the plan',
  },
];
