/** A cheaper vendor, free on the party date, for an item not yet booked. */
export interface BudgetSwap {
  category: string;
  currentName: string;
  currentPrice: number;
  replacementId: string;
  replacementName: string;
  replacementPrice: number;
  saving: number;
}
