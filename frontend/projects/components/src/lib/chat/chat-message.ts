import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AvatarComponent } from '../avatar/avatar';
import { MascotComponent } from '../mascot/mascot';

/** One message: the parent's bubble on the right, Giddy's on the left with the mascot. */
@Component({
  selector: 'li[giddy-chat-message]',
  imports: [AvatarComponent, MascotComponent],
  templateUrl: './chat-message.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'msg',
    '[class.msg--me]': "author() === 'parent'",
    '[class.msg--agent]': "author() === 'giddy'",
  },
})
export class ChatMessageComponent {
  readonly author = input.required<'parent' | 'giddy'>();
  /** The parent's name, shown as initials. */
  readonly authorName = input('');
  /** Shown under the bubble, for example "2:03 pm". */
  readonly time = input<string | null>(null);
}
