import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BookVenueRequest } from './book-venue-request';
import { Booking } from './booking';
import { BookingNotice } from './booking-notice';
import { BookingsApi } from './bookings-api';
import { CancellationResult } from './cancellation-result';
import { SavedCard } from './saved-card';

@Injectable()
export class HttpBookingsApi implements BookingsApi {
  private readonly http = inject(HttpClient);

  book(partyId: string, request: BookVenueRequest): Observable<Booking> {
    return this.http.post<Booking>(`/api/parties/${partyId}/bookings`, request);
  }

  completeAuthentication(partyId: string, bookingId: string): Observable<Booking> {
    return this.http.post<Booking>(
      `/api/parties/${partyId}/bookings/${bookingId}/authentication`,
      null,
    );
  }

  cancel(partyId: string, bookingId: string): Observable<CancellationResult> {
    return this.http.post<CancellationResult>(
      `/api/parties/${partyId}/bookings/${bookingId}/cancel`,
      null,
    );
  }

  notices(partyId: string): Observable<BookingNotice[]> {
    return this.http.get<BookingNotice[]>(`/api/parties/${partyId}/booking-notices`);
  }

  savedCards(): Observable<SavedCard[]> {
    return this.http.get<SavedCard[]>('/api/payment-methods');
  }
}
