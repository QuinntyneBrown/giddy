import { Observable } from 'rxjs';
import { PartySummary } from './party-summary';

export interface PartiesApi {
  mine(): Observable<PartySummary[]>;
}
