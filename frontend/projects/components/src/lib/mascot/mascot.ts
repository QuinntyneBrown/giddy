import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MascotMood } from './mascot-mood';

const labels: Record<MascotMood, string> = {
  happy: 'Giddy the balloon',
  party: 'Giddy celebrating',
  sleepy: 'Giddy the balloon',
  worried: 'Giddy looking worried',
};

/** Giddy the balloon, in the mood that fits the moment. */
@Component({
  selector: 'svg[giddy-mascot]',
  templateUrl: './mascot.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'mascot',
    role: 'img',
    viewBox: '0 -8 64 80',
    '[class.mascot--sm]': "size() === 'sm'",
    '[class.mascot--lg]': "size() === 'lg'",
    '[class.mascot--xl]': "size() === 'xl'",
    '[class.mascot--party]': "mood() === 'party'",
    '[class.mascot--sleepy]': "mood() === 'sleepy'",
    '[class.mascot--worried]': "mood() === 'worried'",
    '[attr.aria-label]': 'label()',
  },
})
export class MascotComponent {
  readonly mood = input<MascotMood>('happy');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly ariaLabel = input<string | null>(null);
  protected readonly label = computed(() => this.ariaLabel() ?? labels[this.mood()]);
}
