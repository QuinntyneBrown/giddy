import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RunSheet } from './run-sheet';
import { RunSheetApi } from './run-sheet-api';

@Injectable()
export class HttpRunSheetApi implements RunSheetApi {
  private readonly http = inject(HttpClient);

  get(partyId: string): Observable<RunSheet> {
    return this.http.get<RunSheet>(`/api/parties/${partyId}/run-sheet`);
  }

  draft(partyId: string): Observable<RunSheet> {
    return this.http.post<RunSheet>(`/api/parties/${partyId}/run-sheet/draft`, {});
  }
}
