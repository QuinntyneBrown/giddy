import { Observable } from 'rxjs';
import { Conversation } from '../conversations/conversation';
import { BudgetRange } from './budget-range';
import { CreatePartyRequest } from './create-party-request';
import { PartyBooking } from './party-booking';
import { PartyOverview } from './party-overview';
import { PartySummary } from './party-summary';
import { PlanApplied } from './plan-applied';

export interface PartiesApi {
  mine(): Observable<PartySummary[]>;
  create(request: CreatePartyRequest): Observable<PartySummary>;
  overview(partyId: string): Observable<PartyOverview>;
  bookings(partyId: string): Observable<PartyBooking[]>;
  /** Owner only. Bookings are not cancelled and guests are not notified. */
  delete(partyId: string): Observable<void>;
  /** A new conversation with Giddy about this party. */
  startConversation(partyId: string): Observable<Conversation>;
  budgetGuide(guests: number): Observable<BudgetRange>;
  /** Applies a plan Giddy proposed. Nothing is booked or paid. */
  applyPlan(partyId: string, proposalId: string): Observable<PlanApplied>;
}
