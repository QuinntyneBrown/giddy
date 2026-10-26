import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A party with its countdown: the big number of days, an eyebrow, the party's heading and a
 * projected meta row (date, place, guests).
 */
@Component({
  selector: 'giddy-party-card',
  templateUrl: './party-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'party-card' },
})
export class PartyCardComponent {
  readonly heading = input.required<string>();
  readonly headingId = input.required<string>();
  readonly eyebrow = input<string | null>(null);
  /** Calendar days to the party; 0 shows "Today" and 1 shows "Tomorrow". */
  readonly daysToGo = input.required<number>();
}
