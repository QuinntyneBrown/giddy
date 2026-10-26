import { ChangeDetectionStrategy, Component } from '@angular/core';

/** A large selectable card wrapping a native radio or checkbox. */
@Component({
  selector: 'label[giddy-choice-card]',
  templateUrl: './choice-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'choice-card' },
})
export class ChoiceCardComponent {}
