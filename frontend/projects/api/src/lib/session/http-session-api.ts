import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Session } from './session';
import { SessionApi } from './session-api';

@Injectable()
export class HttpSessionApi implements SessionApi {
  private readonly http = inject(HttpClient);

  current(): Observable<Session> {
    return this.http.get<Session>('/api/session');
  }

  refreshAntiforgeryToken(): Observable<void> {
    return this.http.get<{ token: string }>('/api/antiforgery').pipe(map(() => undefined));
  }
}
