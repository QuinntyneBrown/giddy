import { BudgetCategory } from './budget-category';
import { BudgetLine } from './budget-line';
import { BudgetSwap } from './budget-swap';

/** Everything in Canadian dollars, HST included. */
export interface Budget {
  budget: number | null;
  planned: number;
  paid: number;
  left: number | null;
  perKid: number | null;
  over: boolean;
  overBy: number;
  categories: BudgetCategory[];
  lines: BudgetLine[];
  /** When over budget, Giddy's swaps that bring the total back within it. */
  swaps: BudgetSwap[];
}
