/** GET /api/parties/{id}/booking-notices: a banner about the party's venue booking. */
export interface BookingNotice {
  kind: 'hold' | 'confirmed' | 'declined' | 'disruption' | 'quote-expiring';
  tone: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  text: string;
  dismissible: boolean;
  bookingId: string | null;
  venueId: string | null;
  /** For quote-expiring: the quote to confirm. */
  quoteId?: string | null;
  /** For quote-expiring: the vendor's category, to find another. */
  category?: string | null;
}
