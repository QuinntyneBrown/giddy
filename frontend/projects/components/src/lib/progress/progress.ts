import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** A determinate progress bar; leave value null for work of unknown length. */
@Component({
  selector: 'giddy-progress',
  templateUrl: './progress.html',
  styleUrl: './progress.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'progress',
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'value()',
    '[attr.aria-label]': 'label()',
    '[class.progress--indeterminate]': 'value() === null',
  },
})
export class ProgressComponent {
  /** 0 to 100. */
  readonly value = input<number | null>(null);
  readonly label = input.required<string>();
  protected readonly width = computed(() => `${Math.max(0, Math.min(100, this.value() ?? 0))}%`);
}
