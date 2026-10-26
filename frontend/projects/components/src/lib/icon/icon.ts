import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconName } from './icon-name';
import { ICON_SHAPES } from './icon-shapes';

/** A decorative line icon. Give the surrounding control its accessible name. */
@Component({
  selector: 'svg[giddy-icon]',
  templateUrl: './icon.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'icon',
    '[class.icon--sm]': "size() === 'sm'",
    '[class.icon--lg]': "size() === 'lg'",
    'aria-hidden': 'true',
    viewBox: '0 0 24 24',
  },
})
export class IconComponent {
  readonly name = input.required<IconName>({ alias: 'giddy-icon' });
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  protected readonly shapes = computed(() => ICON_SHAPES[this.name()]);
}
