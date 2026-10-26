import { InboxItem } from './inbox-item';

export interface Inbox {
  unread: number;
  /** Unread first, then earlier ones; the last 90 days. */
  items: InboxItem[];
}
