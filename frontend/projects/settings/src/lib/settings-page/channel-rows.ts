import { ChannelRow } from './channel-row';

export const channelRows: ChannelRow[] = [
  { key: 'rsvps', name: 'RSVPs', description: 'When a guest replies or changes their reply' },
  {
    key: 'vendors',
    name: 'Vendor quotes and bookings',
    description: 'Quotes, confirmations and changes',
  },
  { key: 'reminders', name: 'Giddy’s reminders', description: 'Checklist due dates and nudges' },
  { key: 'ideas', name: 'Party ideas', description: 'About 2 emails a month' },
];
