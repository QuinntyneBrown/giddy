import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Conversation } from '../conversations/conversation';
import { BudgetRange } from './budget-range';
import { CreatePartyRequest } from './create-party-request';
import { PartiesApi } from './parties-api';
import { PartyBooking } from './party-booking';
import { PartyOverview } from './party-overview';
import { PartySummary } from './party-summary';
import { PlanApplied } from './plan-applied';

@Injectable()
export class HttpPartiesApi implements PartiesApi {
  private readonly http = inject(HttpClient);

  mine(): Observable<PartySummary[]> {
    return this.http.get<PartySummary[]>('/api/parties');
  }

  create(request: CreatePartyRequest): Observable<PartySummary> {
    return this.http.post<PartySummary>('/api/parties', request);
  }

  overview(partyId: string): Observable<PartyOverview> {
    return this.http.get<PartyOverview>(`/api/parties/${partyId}/overview`);
  }

  bookings(partyId: string): Observable<PartyBooking[]> {
    return this.http.get<PartyBooking[]>(`/api/parties/${partyId}/bookings`);
  }

  delete(partyId: string): Observable<void> {
    return this.http.delete(`/api/parties/${partyId}`).pipe(map(() => undefined));
  }

  startConversation(partyId: string): Observable<Conversation> {
    return this.http.post<Conversation>(`/api/parties/${partyId}/conversations`, {});
  }

  budgetGuide(guests: number): Observable<BudgetRange> {
    return this.http.get<BudgetRange>('/api/budget-guide', { params: { guests } });
  }

  applyPlan(partyId: string, proposalId: string): Observable<PlanApplied> {
    return this.http.post<PlanApplied>(`/api/parties/${partyId}/plan`, { proposalId });
  }
}
