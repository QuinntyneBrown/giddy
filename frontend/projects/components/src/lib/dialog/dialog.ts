import { DialogRef } from '@angular/cdk/dialog';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
} from '@angular/core';
import { ButtonComponent } from '../button/button';
import { IconComponent } from '../icon/icon';
import { DialogTone } from './dialog-tone';

/**
 * The layout of a dialog opened with GiddyDialog: icon, title, description, close button, body
 * and a sticky footer (project buttons with the giddyDialogFooter attribute). A bottom sheet below
 * 640px and centred above. While busy, Esc and Close are disabled.
 */
@Component({
  selector: 'giddy-dialog',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './dialog.html',
  styleUrl: './dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  private readonly dialogRef = inject(DialogRef);
  readonly heading = input.required<string>();
  readonly description = input<string | null>(null);
  readonly tone = input<DialogTone>('info');
  /** lg for dialogs with a form and a summary, such as booking. */
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly busy = input(false, { transform: booleanAttribute });
  protected readonly titleId = `${this.dialogRef.id}-title`;
  protected readonly descriptionId = `${this.dialogRef.id}-description`;

  constructor() {
    effect(() => (this.dialogRef.disableClose = this.busy()));
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
