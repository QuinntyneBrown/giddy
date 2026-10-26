/** GET /api/venues/{id}?date: a venue and its slots on that date. */
export interface VenueDetail {
  id: string;
  name: string;
  emoji: string;
  photoDescription: string;
  rating: number;
  reviewCount: number;
  address: string;
  neighbourhood: string;
  distanceKm: number | null;
  description: string;
  features: string[];
  price: number;
  durationMinutes: number;
  capacity: number;
  includes: string[];
  addOns: { name: string; price: string }[];
  reviews: { author: string; occasion: string; when: string; rating: number; text: string }[];
  date: string;
  slots: { start: string; end: string; booked: boolean }[];
  /** The earliest free slot. */
  selectedSlot: string | null;
  fullyBooked: boolean;
  nearestFreeDate: { date: string; start: string; end: string } | null;
  similarVenue: {
    id: string;
    name: string;
    distanceKm: number;
    price: number;
    start: string;
  } | null;
  favourite: boolean;
}
