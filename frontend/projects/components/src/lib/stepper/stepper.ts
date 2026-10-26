import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Progress through a short flow. Steps before the current one are complete. */
@Component({
  selector: 'ol[giddy-stepper]',
  templateUrl: './stepper.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'stepper' },
})
export class StepperComponent {
  readonly steps = input.required<string[]>();
  readonly current = input(0);
}
