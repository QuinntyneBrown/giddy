import { Observable } from 'rxjs';
import { Inbox } from './inbox';

export interface NotificationsApi {
  inbox(): Observable<Inbox>;
  unreadCount(): Observable<{ unread: number }>;
  markRead(itemId: string): Observable<{ unread: number }>;
  markAllRead(): Observable<{ unread: number }>;
}
