/** GET /api/venues/search parameters. */
export interface VenueSearch {
  partyId: string | null;
  date: string;
  guests: number;
  radiusKm: number;
  maxPrice: number | null;
  indoor: boolean;
  nutFree: boolean;
  parking: boolean;
  stepFree: boolean;
  sort: 'best' | 'closest' | 'price' | 'rating';
}
