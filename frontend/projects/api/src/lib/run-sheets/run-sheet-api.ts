import { Observable } from 'rxjs';
import { RunSheet } from './run-sheet';

export interface RunSheetApi {
  get(partyId: string): Observable<RunSheet>;
  /** "Draft my run sheet", for a party with bookings and no run sheet yet. */
  draft(partyId: string): Observable<RunSheet>;
}
