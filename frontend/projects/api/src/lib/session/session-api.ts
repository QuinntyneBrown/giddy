import { Observable } from 'rxjs';
import { Session } from './session';

export interface SessionApi {
  /** The signed-in parent; errors with status 401 when nobody is signed in. */
  current(): Observable<Session>;
  /** Issues the XSRF-TOKEN cookie that state-changing requests echo back. */
  refreshAntiforgeryToken(): Observable<void>;
}
