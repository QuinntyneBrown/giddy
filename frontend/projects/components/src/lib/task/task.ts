import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

/** A checklist task with its due date; late tasks say so in words. */
@Component({
  selector: 'li[giddy-task]',
  templateUrl: './task.html',
  styleUrl: './task.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'task' },
})
export class TaskComponent {
  readonly heading = input.required<string>();
  readonly due = input.required<string>();
  readonly late = input(false, { transform: booleanAttribute });
}
