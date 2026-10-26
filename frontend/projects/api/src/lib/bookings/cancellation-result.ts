/** POST /api/parties/{id}/bookings/{bookingId}/cancel. */
export interface CancellationResult {
  refunded: boolean;
  /** The deposit, refunded or kept by the venue. */
  amount: number;
}
