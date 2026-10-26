import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

/** A set of choice cards with a legend. Project label[giddy-choice-card] items. */
@Component({
  selector: 'fieldset[giddy-choice-group]',
  templateUrl: './choice-group.html',
  styleUrl: './choice-group.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChoiceGroupComponent {
  readonly legend = input.required<string>();
  /** Keep the legend for screen readers when a visible heading already asks the question. */
  readonly hideLegend = input(false, { transform: booleanAttribute });
}
