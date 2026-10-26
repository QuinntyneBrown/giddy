import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '../button/button';
import { IconComponent } from '../icon/icon';

/**
 * A drop zone for one file that is also a file picker; once a file is chosen it shows its name
 * and details with "Choose another file".
 */
@Component({
  selector: 'giddy-file-drop',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './file-drop.html',
  styleUrl: './file-drop.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileDropComponent {
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('picker');
  /** File types for the picker, for example ".csv,.xlsx". */
  readonly accept = input.required<string>();
  /** What can be chosen, for example ".csv or .xlsx up to 2 MB". */
  readonly hint = input.required<string>();
  /** The chosen file's name, or null before one is chosen. */
  readonly fileName = input<string | null>(null);
  /** For example "18 rows · 3 KB". */
  readonly fileDetail = input<string | null>(null);
  readonly chosen = output<File>();
  protected readonly dragging = signal(false);

  protected pick(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.chosen.emit(file);
    (event.target as HTMLInputElement).value = '';
  }

  protected drop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.chosen.emit(file);
  }

  protected over(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected chooseAnother(): void {
    this.input()?.nativeElement.click();
  }
}
