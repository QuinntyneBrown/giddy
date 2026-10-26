/** A tick made while offline, waiting to sync. */
export interface TaskChange {
  partyId: string;
  taskId: string;
  title: string;
  done: boolean;
  /** The task's version when it was ticked, sent as If-Match. */
  version: string;
}
