import { ProposalItem } from './proposal-item';

/** A priced plan Giddy proposed. */
export interface Proposal {
  id: string;
  title: string;
  theme: { name: string; detail: string };
  items: ProposalItem[];
  total: number;
  budget: number | null;
  overBudgetBy: number;
  applied: boolean;
}
