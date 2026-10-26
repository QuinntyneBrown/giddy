import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DeletionCheck } from './deletion-check';
import { PrivacyApi } from './privacy-api';

@Injectable()
export class HttpPrivacyApi implements PrivacyApi {
  private readonly http = inject(HttpClient);

  requestExport(): Observable<void> {
    return this.http.post<void>('/api/privacy/export', {});
  }

  deletionCheck(): Observable<DeletionCheck> {
    return this.http.get<DeletionCheck>('/api/privacy/deletion-check');
  }

  deleteAccount(email: string): Observable<void> {
    return this.http.post<void>('/api/privacy/delete-account', { email });
  }
}
