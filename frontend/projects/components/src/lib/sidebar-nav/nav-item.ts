import { IconName } from '../icon/icon-name';

export interface NavItem {
  label: string;
  link: string;
  icon: IconName;
  /** Unread count shown as a badge; omitted when zero. */
  count?: number;
  /** Spoken name for the count, for example "3 unread". */
  countLabel?: string;
  /** Match the link exactly when deciding the current page. */
  exact?: boolean;
}
