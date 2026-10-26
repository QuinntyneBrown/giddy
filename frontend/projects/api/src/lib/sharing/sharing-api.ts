import { Observable } from 'rxjs';
import { Members } from './members';
import { PartyRole } from '../parties/party-role';
import { SharedSummary } from './shared-summary';

export interface SharingApi {
  members(partyId: string): Observable<Members>;
  invite(partyId: string, email: string, role: PartyRole): Observable<void>;
  remove(partyId: string, parentId: string): Observable<void>;
  /** A new view-only link; the old one stops working. */
  shareLink(partyId: string): Observable<{ token: string; url: string }>;
  join(token: string): Observable<{ partyId: string; partyName: string }>;
  shared(token: string): Observable<SharedSummary>;
}
