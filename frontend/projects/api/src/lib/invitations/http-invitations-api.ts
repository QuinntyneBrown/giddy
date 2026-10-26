import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Invitation } from './invitation';
import { InvitationEdit } from './invitation-edit';
import { InvitationsApi } from './invitations-api';
import { InvitationsSent } from './invitations-sent';

@Injectable()
export class HttpInvitationsApi implements InvitationsApi {
  private readonly http = inject(HttpClient);

  get(partyId: string): Observable<Invitation> {
    return this.http.get<Invitation>(`/api/parties/${partyId}/invitation`);
  }

  save(partyId: string, edit: InvitationEdit): Observable<Invitation> {
    return this.http.put<Invitation>(`/api/parties/${partyId}/invitation`, edit);
  }

  sendTest(partyId: string): Observable<void> {
    return this.http
      .post(`/api/parties/${partyId}/invitation/test`, null)
      .pipe(map(() => undefined));
  }

  send(partyId: string): Observable<InvitationsSent> {
    return this.http.post<InvitationsSent>(`/api/parties/${partyId}/invitation/send`, null);
  }
}
