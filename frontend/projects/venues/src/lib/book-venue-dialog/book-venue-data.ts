import { Booking, SavedCard, VenueDetail } from '@giddy/api';

/** What the booking dialog needs: the party, the venue and slot, and the parent's saved cards. */
export interface BookVenueData {
  partyId: string;
  /** For the title, for example "Zuri". */
  childName: string | null;
  /** Pre-filled birthday child, for example "Zuri, turning 7". */
  child: string;
  bookingName: string;
  allergies: string[];
  venue: VenueDetail;
  slot: { start: string; end: string };
  savedCards: SavedCard[];
  /** A booking held while the bank checks it is the parent, to finish. */
  resume: Booking | null;
}
