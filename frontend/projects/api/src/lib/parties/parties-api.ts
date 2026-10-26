import { Observable } from 'rxjs';
import { PartySummary } from './party-summary';
import { PlanApplied } from './plan-applied';

export interface PartiesApi {
  mine(): Observable<PartySummary[]>;
  /** Applies a plan Giddy proposed. Nothing is booked or paid. */
  applyPlan(partyId: string, proposalId: string): Observable<PlanApplied>;
}
