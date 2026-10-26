import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PopColour } from '../pop/pop-colour';
import { InviteDesign } from './invite-design';

const looks: Record<InviteDesign, { emoji: string; pop: PopColour; eyebrow: string }> = {
  'dino-green': { emoji: '🦕', pop: 'mint', eyebrow: 'You’re invited to dig in!' },
  volcano: { emoji: '🌋', pop: 'orange', eyebrow: 'You’re invited to erupt with fun!' },
  fossil: { emoji: '🦴', pop: 'sun', eyebrow: 'You’re invited to a fossil hunt!' },
  'night-sky': { emoji: '🌌', pop: 'sky', eyebrow: 'You’re invited!' },
};

/** A party invitation in one of the launch designs, as guests will see it. */
@Component({
  selector: 'div[giddy-invite]',
  templateUrl: './invite.html',
  styleUrl: './invite.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': "'invite confetti pop--' + look().pop" },
})
export class InviteComponent {
  readonly design = input.required<InviteDesign>();
  readonly headline = input.required<string>();
  /** "Sat 14 Nov · 1:00–3:30 pm" */
  readonly when = input.required<string>();
  readonly place = input<string | null>(null);
  readonly message = input.required<string>();
  /** "Please reply by Fri 6 Nov" */
  readonly replyBy = input.required<string>();
  /** The heading level of the headline: 1 when the invitation is the page. */
  readonly level = input<1 | 2>(2);
  protected readonly look = computed(() => looks[this.design()]);
}
