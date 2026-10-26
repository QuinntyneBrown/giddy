import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The conversation, announced politely. While Giddy is still working the log is busy, so screen
 * readers announce the reply once it is complete.
 */
@Component({
  selector: 'ol[giddy-chat-log]',
  templateUrl: './chat-log.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'chat__log', 'aria-live': 'polite', '[attr.aria-busy]': 'busy() || null' },
})
export class ChatLogComponent {
  readonly busy = input(false, { transform: booleanAttribute });
}
