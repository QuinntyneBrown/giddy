import { Planner } from './planner';
import { TaskGroup } from './task-group';

export interface Checklist {
  done: number;
  total: number;
  percent: number;
  overdue: number;
  /** The first task still to do; null when all are done. */
  next: string | null;
  partyDate: string;
  groups: TaskGroup[];
  planners: Planner[];
}
