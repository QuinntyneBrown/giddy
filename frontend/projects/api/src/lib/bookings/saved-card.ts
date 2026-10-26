/** GET /api/payment-methods: a card the parent saved for next time. */
export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
}
