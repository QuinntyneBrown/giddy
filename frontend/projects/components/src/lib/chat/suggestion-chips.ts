import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ChipComponent } from '../chip/chip';

/** Up to four replies the parent can send with one tap, written in their voice. */
@Component({
  selector: 'giddy-suggestion-chips',
  imports: [ChipComponent],
  templateUrl: './suggestion-chips.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'suggestions' },
})
export class SuggestionChipsComponent {
  readonly suggestions = input.required<string[]>();
  readonly disabled = input(false);
  readonly chosen = output<string>();
}
