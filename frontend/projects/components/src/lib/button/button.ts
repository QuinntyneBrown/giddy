import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ButtonSize } from './button-size';
import { ButtonVariant } from './button-variant';

/**
 * Pill-shaped pressable button. Apply to a `<button>` for actions or to an `<a>` for navigation;
 * the element keeps its native semantics.
 */
@Component({
  selector: 'button[giddy-button], a[giddy-button]',
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'btn',
    '[class.btn--primary]': "variant() === 'primary'",
    '[class.btn--ghost]': "variant() === 'ghost' || variant() === 'danger-ghost'",
    '[class.btn--ghost-danger]': "variant() === 'danger-ghost'",
    '[class.btn--danger]': "variant() === 'danger'",
    '[class.btn--link]': "variant() === 'link'",
    '[class.btn--sm]': "size() === 'sm'",
    '[class.btn--lg]': "size() === 'lg'",
    '[class.btn--block]': 'block()',
    '[class.btn--icon]': 'iconOnly()',
    '[attr.aria-busy]': 'busy() || null',
    '[attr.aria-pressed]': 'pressed()',
  },
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('secondary');
  readonly size = input<ButtonSize>('md');
  readonly block = input(false, { transform: booleanAttribute });
  readonly iconOnly = input(false, { transform: booleanAttribute });
  readonly busy = input(false, { transform: booleanAttribute });
  /** Makes the button a toggle button; null leaves it a plain button. */
  readonly pressed = input<boolean | null>(null);
}
