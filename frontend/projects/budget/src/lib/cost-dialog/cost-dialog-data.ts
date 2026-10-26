import { BudgetLine } from '@giddy/api';

export interface CostDialogData {
  partyId: string;
  /** The party's budget, for the "left after this" preview; null when none was set. */
  budget: number | null;
  /** Everything planned now, including the cost being changed. */
  planned: number;
  /** The cost to change, or null to add one. */
  cost: BudgetLine | null;
}
