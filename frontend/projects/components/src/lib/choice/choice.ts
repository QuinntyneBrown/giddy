import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A native radio or checkbox with its label and an optional description. Project the input
 * first, then the label text. Group radios in a fieldset with a legend that asks the question.
 */
@Component({
  selector: 'label[giddy-choice]',
  templateUrl: './choice.html',
  styleUrl: './choice.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'choice', '[class.choice--centred]': 'centred()' },
})
export class ChoiceComponent {
  readonly description = input<string | null>(null);
  /** Centres a lone control, such as a checkbox in a table cell named by aria-label. */
  readonly centred = input(false, { transform: booleanAttribute });
}
