import { Observable } from 'rxjs';
import { Home } from './home';
import { Nudge } from './nudge';

export interface HomeApi {
  get(): Observable<Home>;
  /** Loaded separately so a failure stays in the nudges card. */
  nudges(): Observable<Nudge[]>;
}
