import { NotificationChoices } from '@giddy/api';

/** One row of the notification channels table. */
export interface ChannelRow {
  key: keyof NotificationChoices;
  name: string;
  description: string;
}
