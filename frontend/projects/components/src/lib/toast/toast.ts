import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon';
import { IconName } from '../icon/icon-name';

/**
 * A short message with an optional action (projected). Messages that update in place, such as a
 * selection count, stay until their reason goes away; they never time out.
 */
@Component({
  selector: 'giddy-toast',
  imports: [IconComponent],
  templateUrl: './toast.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'toast' },
})
export class ToastComponent {
  readonly heading = input.required<string>();
  readonly text = input<string | null>(null);
  readonly icon = input<IconName>('check-circle');
}
