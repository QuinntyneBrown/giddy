import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LiveUpdates } from './live-updates';
import { LiveUpdatesApi } from './live-updates-api';

@Injectable()
export class HttpLiveUpdatesApi implements LiveUpdatesApi {
  private readonly http = inject(HttpClient);

  poll(after: number | null): Observable<LiveUpdates> {
    const params: Record<string, string> = after === null ? {} : { after: String(after) };
    return this.http.get<LiveUpdates>('/api/live-updates', { params });
  }
}
