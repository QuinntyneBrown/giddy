import { ChecklistTask } from './checklist-task';

export interface TaskGroup {
  name: 'Overdue' | 'This week' | 'Before the party' | 'Done';
  tasks: ChecklistTask[];
}
