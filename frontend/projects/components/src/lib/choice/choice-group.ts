import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** A set of choice cards with a legend. Project label[giddy-choice-card] items. */
@Component({
  selector: 'fieldset[giddy-choice-group]',
  templateUrl: './choice-group.html',
  styleUrl: './choice-group.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChoiceGroupComponent {
  readonly legend = input.required<string>();
}
