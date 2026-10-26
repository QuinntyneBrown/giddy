/** GET /api/parties/{id}/booking-notices: a banner about the party's venue booking. */
export interface BookingNotice {
  kind: 'hold' | 'confirmed' | 'declined' | 'disruption';
  tone: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  text: string;
  dismissible: boolean;
  bookingId: string | null;
  venueId: string | null;
}
