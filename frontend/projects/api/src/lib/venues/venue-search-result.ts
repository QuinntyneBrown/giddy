import { RelaxationSuggestion } from './relaxation-suggestion';
import { VenueResult } from './venue-result';

export interface VenueSearchResult {
  area: string | null;
  radiusKm: number;
  /** The area is outside the GTA, which is all Giddy covers for now. */
  outsideServiceArea: boolean;
  results: VenueResult[];
  noResults: { conflicts: string[]; suggestion: RelaxationSuggestion | null } | null;
}
