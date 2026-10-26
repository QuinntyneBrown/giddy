/** One of the parent's own costs, as they enter it. */
export interface Cost {
  description: string;
  category: string;
  amount: number;
  paid: boolean;
}
