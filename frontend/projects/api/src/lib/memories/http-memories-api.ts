import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Memory } from '../conversations/memory';
import { MemoriesApi } from './memories-api';

@Injectable()
export class HttpMemoriesApi implements MemoriesApi {
  private readonly http = inject(HttpClient);

  list(): Observable<Memory[]> {
    return this.http.get<Memory[]>('/api/memories');
  }

  forget(memoryId: string): Observable<void> {
    return this.http.delete(`/api/memories/${memoryId}`).pipe(map(() => undefined));
  }
}
