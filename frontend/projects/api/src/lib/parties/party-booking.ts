/** GET /api/parties/{id}/bookings, loaded on its own so it can fail alone. */
export interface PartyBooking {
  category: string;
  name: string;
  price: number;
  status: 'toBook' | 'confirmed';
  /** Paid so far, for example a venue's deposit. */
  paid: number;
}
