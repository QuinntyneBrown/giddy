/** GET /api/parties/{id}/bookings, loaded on its own so it can fail alone. */
export interface PartyBooking {
  category: string;
  name: string;
  price: number;
  status: 'toBook' | 'quoteRequested' | 'quoted' | 'confirmed';
  /** Paid so far, for example a venue's deposit. */
  paid: number;
  /** ISO date a vendor's quote is valid until, while it is quoted. */
  quoteExpiresOn: string | null;
}
