import { Booking } from '@giddy/api';

export interface CancelBookingData {
  partyId: string;
  booking: Booking;
}
