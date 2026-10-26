import { ChecklistTask, Planner } from '@giddy/api';

export interface TaskDialogData {
  partyId: string;
  /** yyyy-MM-dd, for the "days before the party" hint. */
  partyDate: string;
  planners: Planner[];
  /** The task to change, or null to add one. */
  task: ChecklistTask | null;
}
