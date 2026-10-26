import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon';
import { SpinnerComponent } from '../spinner/spinner';

export interface ToolStepView {
  text: string;
  done: boolean;
}

/** Giddy's work for a reply: a spinner while a step runs, a tick when it is done. */
@Component({
  selector: 'ul[giddy-tool-steps]',
  imports: [IconComponent, SpinnerComponent],
  templateUrl: './tool-steps.html',
  styleUrl: './tool-steps.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'stack stack--sm' },
})
export class ToolStepsComponent {
  readonly steps = input.required<ToolStepView[]>();
}
