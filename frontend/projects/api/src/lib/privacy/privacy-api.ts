import { Observable } from 'rxjs';
import { DeletionCheck } from './deletion-check';

export interface PrivacyApi {
  /** Emails a link to a download of the parent's data. */
  requestExport(): Observable<void>;
  deletionCheck(): Observable<DeletionCheck>;
  /** Needs the sign-in email typed to confirm; signs the parent out. */
  deleteAccount(email: string): Observable<void>;
}
