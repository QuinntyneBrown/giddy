import { NotificationChoices } from './notification-choices';

export interface Settings {
  firstName: string;
  lastName: string | null;
  email: string;
  /** A new address waiting for confirmation; null when none. */
  pendingEmail: string | null;
  mobile: string | null;
  postalCode: string | null;
  quietHours: boolean;
  notifications: NotificationChoices;
}
