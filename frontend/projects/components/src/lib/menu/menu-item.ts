import { IconName } from '../icon/icon-name';

export interface MenuItem {
  /** Emitted when the item is chosen. */
  id: string;
  label: string;
  icon: IconName;
  /** Destructive actions are drawn in the danger colour, last, after a divider. */
  danger?: boolean;
}
