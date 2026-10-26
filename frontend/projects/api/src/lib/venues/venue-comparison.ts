/** GET /api/venues/compare: venues side by side with the best value per row marked. */
export interface VenueComparison {
  date: string;
  venues: { id: string; name: string; emoji: string; freeSlot: string | null }[];
  rows: { label: string; cells: { text: string; best: boolean }[] }[];
  recommendation: { venueId: string; name: string; reason: string };
}
