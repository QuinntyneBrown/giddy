export interface FinalNumbers {
  kidsCame: number;
  invited: number;
  /** Everything in the budget: the plan's bookings and the parent's own costs. */
  spent: number;
  budget: number | null;
  gifts: number;
}
