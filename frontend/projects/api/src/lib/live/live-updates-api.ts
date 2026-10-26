import { Observable } from 'rxjs';
import { LiveUpdates } from './live-updates';

export interface LiveUpdatesApi {
  /** Without a cursor, returns no updates and the cursor to start from. */
  poll(after: number | null): Observable<LiveUpdates>;
}
