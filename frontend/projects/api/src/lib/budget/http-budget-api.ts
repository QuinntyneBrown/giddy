import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Budget } from './budget';
import { BudgetApi } from './budget-api';
import { BudgetLine } from './budget-line';
import { Cost } from './cost';

@Injectable()
export class HttpBudgetApi implements BudgetApi {
  private readonly http = inject(HttpClient);

  get(partyId: string): Observable<Budget> {
    return this.http.get<Budget>(`/api/parties/${partyId}/budget`);
  }

  addCost(partyId: string, cost: Cost): Observable<BudgetLine> {
    return this.http.post<BudgetLine>(`/api/parties/${partyId}/budget/lines`, cost);
  }

  changeCost(partyId: string, costId: string, cost: Cost): Observable<BudgetLine> {
    return this.http.put<BudgetLine>(`/api/parties/${partyId}/budget/lines/${costId}`, cost);
  }

  removeCost(partyId: string, costId: string): Observable<void> {
    return this.http.delete<void>(`/api/parties/${partyId}/budget/lines/${costId}`);
  }

  estimate(partyId: string): Observable<Budget> {
    return this.http.post<Budget>(`/api/parties/${partyId}/budget/estimate`, {});
  }

  swap(partyId: string, category: string, replacementId: string): Observable<Budget> {
    return this.http.post<Budget>(`/api/parties/${partyId}/budget/swaps`, {
      category,
      replacementId,
    });
  }
}
