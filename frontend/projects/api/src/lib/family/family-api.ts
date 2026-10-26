import { Observable } from 'rxjs';
import { Family } from './family';

export interface FamilyApi {
  get(): Observable<Family>;
}
