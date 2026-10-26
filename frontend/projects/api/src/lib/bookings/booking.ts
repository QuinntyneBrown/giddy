import { BookingState } from './booking-state';
import { CardSummary } from './card-summary';

/** A venue booking, from POST /api/parties/{id}/bookings and on the venue page. */
export interface Booking {
  id: string;
  venueId: string;
  venueName: string;
  date: string;
  start: string;
  end: string;
  room: string;
  capacity: number;
  contact: string | null;
  state: BookingState;
  confirmationNumber: string | null;
  price: number;
  deposit: number;
  balance: number;
  card: CardSummary | null;
  /** The last day the deposit is refunded on cancellation. */
  freeCancellationUntil: string;
  refundable: boolean;
  /** ISO instant the venue's hold ends. */
  holdExpiresAt: string;
  /** The bank's 3-D Secure page while it checks it is the parent. */
  challengeUrl: string | null;
}
