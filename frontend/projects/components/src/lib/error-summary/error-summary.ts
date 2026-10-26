import { ChangeDetectionStrategy, Component, ElementRef, inject, input } from '@angular/core';
import { IconComponent } from '../icon/icon';
import { ErrorMessage } from './error-message';

/**
 * Lists every fix after a failed submit, with a link to each field. Call focus() after submit
 * so screen reader and keyboard users land on it.
 */
@Component({
  selector: 'giddy-error-summary',
  imports: [IconComponent],
  templateUrl: './error-summary.html',
  styleUrl: './error-summary.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'alert alert--danger form-summary', role: 'alert', tabindex: '-1' },
})
export class ErrorSummaryComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly heading = input('Let’s fix a couple of things');
  readonly errors = input.required<ErrorMessage[]>();

  focus(): void {
    this.host.nativeElement.focus();
  }

  protected goTo(event: Event, targetId: string): void {
    event.preventDefault();
    const target = this.host.nativeElement.ownerDocument.getElementById(targetId);
    target?.focus();
    target?.scrollIntoView({ block: 'center' });
  }
}
