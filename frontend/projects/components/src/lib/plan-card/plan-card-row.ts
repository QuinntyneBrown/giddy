export interface PlanCardRow {
  /** A decorative emoji for the row, for example 🎂. */
  emoji: string;
  title: string;
  meta: string;
  /** Formatted price, or empty for items with no cost. */
  price: string;
  /** A warning shown with the row, for example "Not peanut-free". */
  note?: string | null;
}
