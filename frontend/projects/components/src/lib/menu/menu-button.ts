import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button';
import { IconComponent } from '../icon/icon';
import { MenuItem } from './menu-item';

/**
 * A "⋯" button that opens a few actions in a menu, with arrow-key navigation and Esc to close.
 * Danger items come last, after a divider. Name the button for what it acts on.
 */
@Component({
  selector: 'giddy-menu-button',
  imports: [ButtonComponent, CdkMenu, CdkMenuItem, CdkMenuTrigger, IconComponent],
  templateUrl: './menu-button.html',
  styleUrl: './menu-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuButtonComponent {
  /** The button's accessible name, such as "More actions for Order the cake". */
  readonly label = input.required<string>();
  /** The menu's accessible name, such as "Task actions". */
  readonly menuLabel = input.required<string>();
  readonly items = input.required<MenuItem[]>();
  readonly selected = output<string>();
  /** Below the button, lined up with its end; above it when there is no room below. */
  protected readonly positions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
  ];
  protected readonly actions = computed(() => this.items().filter((i) => !i.danger));
  protected readonly dangers = computed(() => this.items().filter((i) => i.danger));
}
