import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PopColour } from '../pop/pop-colour';

/** A big, friendly shortcut tile with an emoji, used in quick-start grids. */
@Component({
  selector: 'a[giddy-quick-action]',
  templateUrl: './quick-action.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'quick-action', '[class]': "'pop--' + pop()" },
})
export class QuickActionComponent {
  readonly emoji = input.required<string>();
  readonly pop = input<PopColour>('grape');
}
