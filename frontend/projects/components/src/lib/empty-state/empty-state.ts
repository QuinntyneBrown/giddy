import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { MascotComponent } from '../mascot/mascot';

let nextId = 0;

/**
 * Explains what belongs in an empty or failed section and offers a way forward. The error tone
 * is announced as an alert and shows a reference code the parent can quote.
 */
@Component({
  selector: 'section[giddy-empty-state]',
  imports: [MascotComponent],
  templateUrl: './empty-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'empty',
    '[class.empty--error]': "tone() === 'error'",
    '[class.empty--compact]': 'compact()',
    '[attr.role]': "tone() === 'error' ? 'alert' : null",
    '[attr.aria-labelledby]': 'titleId',
  },
})
export class EmptyStateComponent {
  readonly heading = input.required<string>();
  readonly text = input.required<string>();
  readonly tone = input<'neutral' | 'error'>('neutral');
  readonly compact = input(false, { transform: booleanAttribute });
  /** Shown as "quote GDY-7Q2K" under the actions on errors. */
  readonly referenceCode = input<string | null>(null);
  readonly helpEmail = input('help@giddy.party');
  protected readonly titleId = `giddy-empty-state-${nextId++}`;
  protected readonly mood = computed(() => (this.tone() === 'error' ? 'worried' : 'sleepy'));
}
