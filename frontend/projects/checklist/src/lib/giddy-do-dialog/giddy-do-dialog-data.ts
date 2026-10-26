import { ChecklistTask } from '@giddy/api';

export interface GiddyDoDialogData {
  partyId: string;
  task: ChecklistTask;
  /** The booked venue, for the allergy list; null when none is booked. */
  venueName: string | null;
}
