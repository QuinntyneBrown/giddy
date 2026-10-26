import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PartiesApi } from './parties-api';
import { PartySummary } from './party-summary';

@Injectable()
export class HttpPartiesApi implements PartiesApi {
  private readonly http = inject(HttpClient);

  mine(): Observable<PartySummary[]> {
    return this.http.get<PartySummary[]>('/api/parties');
  }
}
