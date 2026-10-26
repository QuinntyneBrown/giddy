import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '../icon/icon';

/**
 * A checklist task with its due date; late tasks say so in words. Checkable tasks have a
 * checkbox labelled by the task; project a menu or other trailing actions as content.
 */
@Component({
  selector: 'li[giddy-task]',
  imports: [IconComponent, NgTemplateOutlet],
  templateUrl: './task.html',
  styleUrl: './task.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'task', '[class.task--done]': 'done()' },
})
export class TaskComponent {
  readonly heading = input.required<string>();
  readonly due = input.required<string>();
  readonly late = input(false, { transform: booleanAttribute });
  readonly checkable = input(false, { transform: booleanAttribute });
  readonly done = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Shows "Giddy can do this". */
  readonly agent = input(false, { transform: booleanAttribute });
  readonly doneChange = output<boolean>();
}
