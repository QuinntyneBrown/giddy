import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../icon/icon';
import { IconName } from '../icon/icon-name';
import { AlertTone } from './alert-tone';

const icons: Record<AlertTone, IconName> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert',
  danger: 'alert',
};

/**
 * A message about the page or the app. Danger is announced as an alert, the rest as status.
 * As a banner it spans the page below the top bar. Errors never dismiss themselves.
 */
@Component({
  selector: 'div[giddy-alert]',
  imports: [IconComponent],
  templateUrl: './alert.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'alert',
    '[class.alert--success]': "tone() === 'success'",
    '[class.alert--warning]': "tone() === 'warning'",
    '[class.alert--danger]': "tone() === 'danger'",
    '[class.banner]': 'banner()',
    '[attr.role]': "tone() === 'danger' ? 'alert' : 'status'",
  },
})
export class AlertComponent {
  readonly tone = input<AlertTone>('info');
  readonly heading = input.required<string>();
  readonly banner = input(false, { transform: booleanAttribute });
  readonly dismissible = input(false, { transform: booleanAttribute });
  readonly dismissed = output<void>();
  protected readonly icon = computed(() => icons[this.tone()]);
}
