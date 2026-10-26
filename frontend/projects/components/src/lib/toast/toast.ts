import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../icon/icon';
import { IconName } from '../icon/icon-name';
import { ToastTone } from './toast-tone';

const toneIcons: Record<ToastTone, IconName> = {
  neutral: 'check-circle',
  info: 'info',
  success: 'check-circle',
  warning: 'alert',
  danger: 'alert',
};

/**
 * A short message with an optional action (projected). Messages that update in place, such as a
 * selection count, stay until their reason goes away; they never time out. A link or button with
 * giddyToastAction sits under the text; anything else is projected beside it.
 */
@Component({
  selector: 'giddy-toast',
  imports: [IconComponent],
  templateUrl: './toast.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'toast',
    '[class.toast--info]': "tone() === 'info'",
    '[class.toast--success]': "tone() === 'success'",
    '[class.toast--warning]': "tone() === 'warning'",
    '[class.toast--danger]': "tone() === 'danger'",
  },
})
export class ToastComponent {
  readonly heading = input.required<string>();
  readonly text = input<string | null>(null);
  readonly tone = input<ToastTone>('neutral');
  /** Overrides the tone's icon. */
  readonly icon = input<IconName | null>(null);
  readonly dismissible = input(false, { transform: booleanAttribute });
  readonly dismissed = output<void>();
  protected readonly shownIcon = computed(() => this.icon() ?? toneIcons[this.tone()]);
}
