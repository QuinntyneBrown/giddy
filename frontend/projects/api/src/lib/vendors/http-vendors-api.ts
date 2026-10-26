import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Quote } from './quote';
import { QuoteRequest } from './quote-request';
import { VendorCategory } from './vendor-category';
import { VendorSearchResult } from './vendor-search-result';
import { VendorsApi } from './vendors-api';

@Injectable()
export class HttpVendorsApi implements VendorsApi {
  private readonly http = inject(HttpClient);

  search(
    partyId: string,
    category: VendorCategory,
    themeOn: boolean,
    maxPrice: number | null,
  ): Observable<VendorSearchResult> {
    const params: Record<string, string> = { partyId, category };
    if (!themeOn) params['theme'] = 'off';
    if (maxPrice !== null) params['maxPrice'] = String(maxPrice);
    return this.http.get<VendorSearchResult>('/api/vendors/search', { params });
  }

  requestQuote(partyId: string, request: QuoteRequest): Observable<Quote> {
    return this.http.post<Quote>(`/api/parties/${partyId}/quotes`, request);
  }

  confirmQuote(partyId: string, quoteId: string): Observable<void> {
    return this.http
      .post(`/api/parties/${partyId}/quotes/${quoteId}/confirm`, null)
      .pipe(map(() => undefined));
  }
}
