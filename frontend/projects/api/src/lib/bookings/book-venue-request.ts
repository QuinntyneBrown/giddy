/** POST /api/parties/{id}/bookings. Pay with a new card's provider token or a saved card. */
export interface BookVenueRequest {
  venueId: string;
  date: string;
  start: string;
  bookingName: string;
  mobile: string;
  child: string;
  notes: string | null;
  payment: { token: string | null; savedCardId: string | null; saveCard: boolean };
}
