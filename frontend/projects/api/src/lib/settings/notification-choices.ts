import { Channels } from './channels';

/** The channels for each kind of message. */
export interface NotificationChoices {
  rsvps: Channels;
  vendors: Channels;
  reminders: Channels;
  ideas: Channels;
}
