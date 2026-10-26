import { Observable } from 'rxjs';
import { BookVenueRequest } from './book-venue-request';
import { Booking } from './booking';
import { BookingNotice } from './booking-notice';
import { CancellationResult } from './cancellation-result';
import { SavedCard } from './saved-card';

export interface BookingsApi {
  /** A confirmed booking, or a holding one while the bank runs 3-D Secure. */
  book(partyId: string, request: BookVenueRequest): Observable<Booking>;
  /** Finishes a holding booking once the bank's check is done. */
  completeAuthentication(partyId: string, bookingId: string): Observable<Booking>;
  cancel(partyId: string, bookingId: string): Observable<CancellationResult>;
  notices(partyId: string): Observable<BookingNotice[]>;
  savedCards(): Observable<SavedCard[]>;
}
