import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '../button/button';
import { IconComponent } from '../icon/icon';

/**
 * The message box. Enter sends and Shift+Enter adds a line. While a reply is running, Send
 * becomes Stop and Esc stops it too.
 */
@Component({
  selector: 'form[giddy-composer]',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './composer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'composer', '[attr.aria-label]': 'label()', '(submit)': 'submit($event)' },
})
export class ComposerComponent {
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly busy = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly sendLabel = input('Send message');
  readonly stopLabel = input('Stop');
  readonly value = model('');
  readonly sent = output<string>();
  readonly stopped = output<void>();
  private readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('box');
  protected readonly inputId = `giddy-composer-${Math.random().toString(36).slice(2, 8)}`;

  focus(): void {
    this.textarea().nativeElement.focus();
  }

  protected keydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.send();
    } else if (event.key === 'Escape' && this.busy()) {
      event.preventDefault();
      this.stopped.emit();
    }
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.send();
  }

  private send(): void {
    const text = this.value().trim();
    if (!text || this.busy() || this.disabled()) return;
    this.sent.emit(text);
    this.value.set('');
    this.focus();
  }
}
