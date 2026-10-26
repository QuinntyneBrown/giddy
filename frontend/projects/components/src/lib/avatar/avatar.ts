import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PopColour } from '../pop/pop-colour';

/** A person's initials in a pop colour. Name the person on the avatar or its parent control. */
@Component({
  selector: 'giddy-avatar, a[giddy-avatar]',
  templateUrl: './avatar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'avatar',
    '[class.avatar--sm]': "size() === 'sm'",
    '[class.avatar--lg]': "size() === 'lg'",
    '[class]': "'pop--' + pop()",
  },
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly pop = input<PopColour>('grape');
  protected readonly initials = computed(() =>
    this.name()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join(''),
  );
}
