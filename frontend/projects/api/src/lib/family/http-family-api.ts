import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Child } from './child';
import { ChildInput } from './child-input';
import { Family } from './family';
import { FamilyApi } from './family-api';
import { Interest } from './interest';

@Injectable()
export class HttpFamilyApi implements FamilyApi {
  private readonly http = inject(HttpClient);

  get(): Observable<Family> {
    return this.http.get<Family>('/api/family');
  }

  interests(): Observable<Interest[]> {
    return this.http.get<Interest[]>('/api/family/interests');
  }

  addChild(child: ChildInput): Observable<Child> {
    return this.http.post<Child>('/api/family/children', child);
  }

  changeChild(childId: string, child: ChildInput): Observable<Child> {
    return this.http.put<Child>(`/api/family/children/${childId}`, child);
  }

  removeChild(childId: string): Observable<void> {
    return this.http.delete<void>(`/api/family/children/${childId}`);
  }
}
