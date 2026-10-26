import { Observable } from 'rxjs';
import { Child } from './child';
import { ChildInput } from './child-input';
import { Family } from './family';
import { Interest } from './interest';

export interface FamilyApi {
  get(): Observable<Family>;
  interests(): Observable<Interest[]>;
  addChild(child: ChildInput): Observable<Child>;
  changeChild(childId: string, child: ChildInput): Observable<Child>;
  removeChild(childId: string): Observable<void>;
}
