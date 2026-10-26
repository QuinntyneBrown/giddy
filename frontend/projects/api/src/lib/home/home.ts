import { RsvpCounts } from '../parties/rsvp-counts';
import { HomeParty } from './home-party';
import { UpcomingBirthday } from './upcoming-birthday';

/** GET /api/home. */
export interface Home {
  partiesInProgress: number;
  /** Unfinished tasks that are overdue or due this week. */
  needsYou: number;
  nextParty: HomeParty | null;
  rsvps: RsvpCounts;
  allergies: number;
  nextBirthday: UpcomingBirthday | null;
}
