/** Venue facts the fake API searches over, matching the API's demo catalogue. */
export interface SeedVenue {
  id: string;
  name: string;
  emoji: string;
  neighbourhood: string;
  address: string;
  distanceKm: number;
  capacity: number;
  minAge: number;
  maxAge: number;
  rating: number;
  reviewCount: number;
  features: string[];
  price: number;
  durationMinutes: number;
  indoor: boolean;
  partyHost: boolean;
  themeFit: string | null;
  slots: { start: string; end: string; booked: boolean }[];
}

const slot = (start: string, end: string, booked = false) => ({ start, end, booked });

export const venues: SeedVenue[] = [
  {
    id: 'b1000000-0000-4000-8000-000000000001',
    name: 'Dino Den Play Café',
    emoji: '🦕',
    neighbourhood: 'Leslieville',
    address: '1124 Queen St E',
    distanceKm: 1.1,
    capacity: 20,
    minAge: 3,
    maxAge: 9,
    rating: 4.8,
    reviewCount: 212,
    features: ['Nut-free kitchen', 'Private room', 'Parking', 'Step-free', 'Party host'],
    price: 340,
    durationMinutes: 150,
    indoor: true,
    partyHost: true,
    themeFit: 'Dino theme room',
    slots: [slot('10:00', '12:30', true), slot('13:00', '15:30'), slot('16:00', '18:30')],
  },
  {
    id: 'b1000000-0000-4000-8000-000000000006',
    name: 'Little Diggers Sandbox Studio',
    emoji: '⛏️',
    neighbourhood: 'Riverdale',
    address: '650 Gerrard St E',
    distanceKm: 1.6,
    capacity: 15,
    minAge: 2,
    maxAge: 7,
    rating: 4.6,
    reviewCount: 98,
    features: ['Indoor sandbox', 'Step-free'],
    price: 295,
    durationMinutes: 120,
    indoor: true,
    partyHost: true,
    themeFit: 'Digging and sand play',
    slots: [slot('10:00', '12:00'), slot('13:00', '15:00', true)],
  },
  {
    id: 'b1000000-0000-4000-8000-000000000007',
    name: 'Maple Climb Kids',
    emoji: '🧗',
    neighbourhood: 'East York',
    address: '45 Overlea Blvd',
    distanceKm: 3.2,
    capacity: 18,
    minAge: 5,
    maxAge: 12,
    rating: 4.7,
    reviewCount: 156,
    features: ['Climbing coach', 'Parking'],
    price: 360,
    durationMinutes: 120,
    indoor: true,
    partyHost: true,
    themeFit: 'Climbing',
    slots: [slot('10:00', '12:00'), slot('13:00', '15:00')],
  },
  {
    id: 'b1000000-0000-4000-8000-000000000008',
    name: 'Beaches Art Loft',
    emoji: '🎨',
    neighbourhood: 'The Beaches',
    address: '2110 Queen St E',
    distanceKm: 3.4,
    capacity: 16,
    minAge: 4,
    maxAge: 12,
    rating: 4.6,
    reviewCount: 88,
    features: ['Art supplies included'],
    price: 275,
    durationMinutes: 120,
    indoor: true,
    partyHost: true,
    themeFit: 'Crafts',
    slots: [slot('14:00', '16:00')],
  },
  {
    id: 'b1000000-0000-4000-8000-000000000009',
    name: 'Junction Science Hub',
    emoji: '🔬',
    neighbourhood: 'The Junction',
    address: '2980 Dundas St W',
    distanceKm: 9.8,
    capacity: 24,
    minAge: 5,
    maxAge: 12,
    rating: 4.9,
    reviewCount: 305,
    features: ['Nut-free kitchen', 'Party host', 'Step-free'],
    price: 420,
    durationMinutes: 150,
    indoor: true,
    partyHost: true,
    themeFit: 'Fossil lab',
    slots: [slot('10:00', '12:30'), slot('13:00', '15:30')],
  },
  {
    id: 'b1000000-0000-4000-8000-000000000003',
    name: 'Danforth Party Room',
    emoji: '🎉',
    neighbourhood: 'Danforth',
    address: '2 Danforth Ave',
    distanceKm: 2.1,
    capacity: 30,
    minAge: 3,
    maxAge: 12,
    rating: 4.2,
    reviewCount: 40,
    features: ['Kitchenette', 'Step-free'],
    price: 260,
    durationMinutes: 180,
    indoor: true,
    partyHost: false,
    themeFit: null,
    slots: [slot('10:00', '13:00', true), slot('14:00', '17:00', true)],
  },
];

export const dinoDenId = venues[0].id;
export const danforthId = venues[5].id;
