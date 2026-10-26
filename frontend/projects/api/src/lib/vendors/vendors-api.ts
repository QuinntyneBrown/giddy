import { Observable } from 'rxjs';
import { Quote } from './quote';
import { QuoteRequest } from './quote-request';
import { VendorCategory } from './vendor-category';
import { VendorSearchResult } from './vendor-search-result';

export interface VendorsApi {
  search(
    partyId: string,
    category: VendorCategory,
    themeOn: boolean,
    maxPrice: number | null,
  ): Observable<VendorSearchResult>;
  /** 400 with errors.start outside the venue booking; 409 when a request is pending. */
  requestQuote(partyId: string, request: QuoteRequest): Observable<Quote>;
  confirmQuote(partyId: string, quoteId: string): Observable<void>;
}
