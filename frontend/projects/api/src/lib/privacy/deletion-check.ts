export interface DeletionCheck {
  /** Confirmed bookings for parties still to come, which deletion doesn't cancel. */
  liveBookings: number;
}
