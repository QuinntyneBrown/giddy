import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Shows that something is working. Decorative: pair it with text that says what. */
@Component({
  selector: 'giddy-spinner',
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'spinner', 'aria-hidden': 'true', '[class.spinner--sm]': "size() === 'sm'" },
})
export class SpinnerComponent {
  readonly size = input<'sm' | 'md'>('md');
}
