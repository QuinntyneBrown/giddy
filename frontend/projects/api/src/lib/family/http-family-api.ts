import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Family } from './family';
import { FamilyApi } from './family-api';

@Injectable()
export class HttpFamilyApi implements FamilyApi {
  private readonly http = inject(HttpClient);

  get(): Observable<Family> {
    return this.http.get<Family>('/api/family');
  }
}
