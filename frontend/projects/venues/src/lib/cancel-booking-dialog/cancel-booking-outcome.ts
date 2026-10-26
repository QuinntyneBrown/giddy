import { CancellationResult } from '@giddy/api';

/** The cancellation's result, or "failed" when it did not go through and the booking stands. */
export type CancelBookingOutcome = CancellationResult | 'failed';
