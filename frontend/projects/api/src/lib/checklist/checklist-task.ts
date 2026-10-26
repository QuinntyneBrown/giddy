import { GiddyAction } from './giddy-action';

export interface ChecklistTask {
  id: string;
  title: string;
  /** yyyy-MM-dd in Toronto. */
  due: string;
  done: boolean;
  doneOn: string | null;
  overdue: boolean;
  ownerId: string;
  ownerName: string;
  remindMe: boolean;
  giddyCanDo: GiddyAction | null;
}
