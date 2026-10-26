import { ChecklistTask } from '@giddy/api';
import { TaskChange } from './task-change';

/** A change made offline to a task a co-planner changed in the meantime. */
export interface SyncConflict {
  change: TaskChange;
  /** "Kemi changed this task while you were offline." */
  message: string;
  /** The task as it is now. */
  current: ChecklistTask;
}
