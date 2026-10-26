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
