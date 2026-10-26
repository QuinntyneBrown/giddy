import { Observable } from 'rxjs';
import { Invitation } from './invitation';
import { InvitationEdit } from './invitation-edit';
import { InvitationsSent } from './invitations-sent';

export interface InvitationsApi {
  get(partyId: string): Observable<Invitation>;
  save(partyId: string, edit: InvitationEdit): Observable<Invitation>;
  /** Sends the invitation only to the signed-in parent. */
  sendTest(partyId: string): Observable<void>;
  /** Fails with 403 and code "email-unverified" until the parent's email is verified. */
  send(partyId: string): Observable<InvitationsSent>;
}
