import { PartyBooking } from '@giddy/api';

export interface DeletePartyData {
  partyId: string;
  partyName: string;
  /** Bookings already confirmed, which deleting does not cancel. */
  confirmedBookings: PartyBooking[];
}
