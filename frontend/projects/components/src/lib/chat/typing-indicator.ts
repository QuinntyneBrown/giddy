import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Three bouncing dots while Giddy is thinking. */
@Component({
  selector: 'giddy-typing-indicator',
  templateUrl: './typing-indicator.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'typing', role: 'img', 'aria-label': 'Giddy is thinking' },
})
export class TypingIndicatorComponent {}
