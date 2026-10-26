import { Observable } from 'rxjs';
import { Budget } from './budget';
import { BudgetLine } from './budget-line';
import { Cost } from './cost';

export interface BudgetApi {
  get(partyId: string): Observable<Budget>;
  addCost(partyId: string, cost: Cost): Observable<BudgetLine>;
  changeCost(partyId: string, costId: string, cost: Cost): Observable<BudgetLine>;
  removeCost(partyId: string, costId: string): Observable<void>;
  /** "Fill in from the plan": Giddy's typical costs, for a party with none yet. */
  estimate(partyId: string): Observable<Budget>;
  swap(partyId: string, category: string, replacementId: string): Observable<Budget>;
}
