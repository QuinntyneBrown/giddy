import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Inbox } from './inbox';
import { NotificationsApi } from './notifications-api';

@Injectable()
export class HttpNotificationsApi implements NotificationsApi {
  private readonly http = inject(HttpClient);

  inbox(): Observable<Inbox> {
    return this.http.get<Inbox>('/api/notifications');
  }

  unreadCount(): Observable<{ unread: number }> {
    return this.http.get<{ unread: number }>('/api/notifications/unread-count');
  }

  markRead(itemId: string): Observable<{ unread: number }> {
    return this.http.post<{ unread: number }>(`/api/notifications/${itemId}/read`, {});
  }

  markAllRead(): Observable<{ unread: number }> {
    return this.http.post<{ unread: number }>('/api/notifications/read-all', {});
  }
}
