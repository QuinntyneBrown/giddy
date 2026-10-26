import { Observable } from 'rxjs';
import { VenueComparison } from './venue-comparison';
import { VenueDetail } from './venue-detail';
import { VenueSearch } from './venue-search';
import { VenueSearchResult } from './venue-search-result';

export interface VenuesApi {
  search(search: VenueSearch): Observable<VenueSearchResult>;
  get(venueId: string, date: string, partyId: string | null): Observable<VenueDetail>;
  compare(venueIds: string[], date: string, partyId: string | null): Observable<VenueComparison>;
  setFavourite(venueId: string, favourite: boolean): Observable<void>;
  /** "Tell me if a slot opens". */
  joinWaitlist(venueId: string, date: string, partyId: string | null): Observable<void>;
}
