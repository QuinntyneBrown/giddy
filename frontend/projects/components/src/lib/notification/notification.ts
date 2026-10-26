import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';

/**
 * One notification as a link to the page it is about: an emoji, the title, the detail and when.
 * Unread ones are tinted, marked with a dot, and say "(unread)" to screen readers. The parent
 * handles `opened` to mark it read and navigate.
 */
@Component({
  selector: 'giddy-notification',
  templateUrl: './notification.html',
  styleUrl: './notification.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
  readonly icon = input.required<string>();
  readonly heading = input.required<string>();
  readonly detail = input('');
  /** "2 h ago", "Yesterday". */
  readonly when = input.required<string>();
  /** The page it is about. */
  readonly link = input.required<string>();
  readonly unread = input(false, { transform: booleanAttribute });
  readonly opened = output<MouseEvent>();
}
