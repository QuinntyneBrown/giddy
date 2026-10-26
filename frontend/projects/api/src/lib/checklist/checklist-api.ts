import { Observable } from 'rxjs';
import { Checklist } from './checklist';
import { ChecklistTask } from './checklist-task';
import { GiddyDidTask } from './giddy-did-task';
import { TaskInput } from './task-input';

export interface ChecklistApi {
  get(partyId: string): Observable<Checklist>;
  add(partyId: string, task: TaskInput): Observable<ChecklistTask>;
  change(partyId: string, taskId: string, task: TaskInput): Observable<ChecklistTask>;
  remove(partyId: string, taskId: string): Observable<void>;
  /** @param version the task's version when the change was made offline; 412 if it has changed since. */
  setDone(
    partyId: string,
    taskId: string,
    done: boolean,
    version?: string,
  ): Observable<ChecklistTask>;
  /** "Let Giddy do it", once the parent has confirmed. */
  letGiddyDo(partyId: string, taskId: string): Observable<GiddyDidTask>;
  /** "Make my checklist", for a party with no tasks. */
  generate(partyId: string): Observable<Checklist>;
}
