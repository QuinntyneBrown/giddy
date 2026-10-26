import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Members } from './members';
import { PartyRole } from '../parties/party-role';
import { SharedSummary } from './shared-summary';
import { SharingApi } from './sharing-api';

@Injectable()
export class HttpSharingApi implements SharingApi {
  private readonly http = inject(HttpClient);

  members(partyId: string): Observable<Members> {
    return this.http.get<Members>(`/api/parties/${partyId}/members`);
  }

  invite(partyId: string, email: string, role: PartyRole): Observable<void> {
    return this.http.post<void>(`/api/parties/${partyId}/members`, { email, role });
  }

  remove(partyId: string, parentId: string): Observable<void> {
    return this.http.delete<void>(`/api/parties/${partyId}/members/${parentId}`);
  }

  shareLink(partyId: string): Observable<{ token: string; url: string }> {
    return this.http.post<{ token: string; url: string }>(`/api/parties/${partyId}/share-link`, {});
  }

  join(token: string): Observable<{ partyId: string; partyName: string }> {
    return this.http.post<{ partyId: string; partyName: string }>('/api/parties/join', { token });
  }

  shared(token: string): Observable<SharedSummary> {
    return this.http.get<SharedSummary>(`/api/shared/${encodeURIComponent(token)}`);
  }
}
