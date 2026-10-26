import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { VenueComparison } from './venue-comparison';
import { VenueDetail } from './venue-detail';
import { VenueSearch } from './venue-search';
import { VenueSearchResult } from './venue-search-result';
import { VenuesApi } from './venues-api';

@Injectable()
export class HttpVenuesApi implements VenuesApi {
  private readonly http = inject(HttpClient);

  search(search: VenueSearch): Observable<VenueSearchResult> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(search)) {
      if (value !== null && value !== false) params = params.set(key, String(value));
    }
    return this.http.get<VenueSearchResult>('/api/venues/search', { params });
  }

  get(venueId: string, date: string, partyId: string | null): Observable<VenueDetail> {
    const params: Record<string, string> = partyId ? { date, partyId } : { date };
    return this.http.get<VenueDetail>(`/api/venues/${venueId}`, { params });
  }

  compare(venueIds: string[], date: string, partyId: string | null): Observable<VenueComparison> {
    const params: Record<string, string> = {
      ids: venueIds.join(','),
      date,
      ...(partyId ? { partyId } : {}),
    };
    return this.http.get<VenueComparison>('/api/venues/compare', { params });
  }

  setFavourite(venueId: string, favourite: boolean): Observable<void> {
    return this.http
      .put(`/api/venues/${venueId}/favourite`, { favourite })
      .pipe(map(() => undefined));
  }

  joinWaitlist(venueId: string, date: string, partyId: string | null): Observable<void> {
    return this.http
      .post(`/api/venues/${venueId}/waitlist`, { date, partyId })
      .pipe(map(() => undefined));
  }
}
