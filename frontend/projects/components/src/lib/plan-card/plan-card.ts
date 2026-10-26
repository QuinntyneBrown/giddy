import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BadgeComponent } from '../badge/badge';
import { PlanCardRow } from './plan-card-row';

/** Giddy's proposed plan: a dashed card of priced rows, a total against the budget, and actions. */
@Component({
  selector: 'section[giddy-plan-card]',
  imports: [BadgeComponent],
  templateUrl: './plan-card.html',
  styleUrl: './plan-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'plan-card', '[attr.aria-label]': "'Plan: ' + heading()" },
})
export class PlanCardComponent {
  readonly heading = input.required<string>();
  readonly emoji = input('');
  readonly rows = input.required<PlanCardRow[]>();
  /** For example "$778 of $800" or "$178 over $600". */
  readonly totalLabel = input.required<string>();
  readonly overBudget = input(false, { transform: booleanAttribute });
}
