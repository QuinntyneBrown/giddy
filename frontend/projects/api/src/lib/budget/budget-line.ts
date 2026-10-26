import { BudgetLineStatus } from './budget-line-status';

/** One item in the budget, in Canadian dollars with HST included. */
export interface BudgetLine {
  /** "plan:<category>" for Giddy's items, the cost's id for the parent's own. */
  id: string;
  /** Only the parent's own costs (expense) are edited by hand. */
  kind: 'plan' | 'expense';
  category: string;
  name: string;
  status: BudgetLineStatus;
  planned: number;
  paid: number;
}
