import { ReminderOutcome } from './reminder-outcome';

/** POST /api/parties/{id}/reminders */
export interface RemindersSent {
  /** First names of the children whose families were reminded. */
  reminded: string[];
  skipped: ReminderOutcome[];
  undeliverable: ReminderOutcome[];
}
