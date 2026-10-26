import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { ProgressRingComponent } from '../progress-ring/progress-ring';

let nextId = 0;

/**
 * The party hero: countdown, eyebrow, the party's name, a meta row (project giddyPartyHeroMeta
 * items), readiness with its detail line, and actions (projected by default).
 */
@Component({
  selector: 'section[giddy-party-hero]',
  imports: [ProgressRingComponent],
  templateUrl: './party-hero.html',
  styleUrl: './party-hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'hero confetti', '[attr.aria-labelledby]': 'headingId' },
})
export class PartyHeroComponent {
  readonly heading = input.required<string>();
  readonly eyebrow = input('Next up');
  readonly daysToGo = input.required<number>();
  /** The party has happened. */
  readonly done = input(false, { transform: booleanAttribute });
  readonly readiness = input.required<number>();
  readonly readinessDetail = input('');
  protected readonly headingId = `giddy-party-hero-${nextId++}`;
  protected readonly readinessLabel = computed(() => `Plan ${this.readiness()}% ready`);
}
