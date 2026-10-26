import { VenueSlot } from './venue-slot';

export interface VenueResult {
  id: string;
  name: string;
  emoji: string;
  neighbourhood: string;
  distanceKm: number;
  capacity: number;
  minAge: number;
  maxAge: number;
  rating: number;
  reviewCount: number;
  features: string[];
  /** Canadian dollars, HST included. */
  price: number;
  durationMinutes: number;
  freeSlots: VenueSlot[];
  /** For example "Fits 15; you invited 16". */
  fitWarning: string | null;
}
