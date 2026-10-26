import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { ApiProblem, WRAP_UP_API } from '@giddy/api';
import {
  AlertComponent,
  ButtonComponent,
  DialogComponent,
  ErrorSummaryComponent,
  FormFieldComponent,
  InputDirective,
} from '@giddy/components';
import { firstValueFrom } from 'rxjs';
import { NoteDialogData } from './note-dialog-data';

const emptyMessage = 'Write a note, or keep Giddy’s draft';

/**
 * Edits one thank-you note: the gift it mentions and its wording. Until the parent changes the
 * wording, Giddy keeps drafting it, so a new gift shows up in the note.
 */
@Component({
  imports: [
    AlertComponent,
    ButtonComponent,
    DialogComponent,
    ErrorSummaryComponent,
    FormFieldComponent,
    InputDirective,
  ],
  templateUrl: './note-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteDialog {
  private readonly api = inject(WRAP_UP_API);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly injector = inject(Injector);
  private readonly summary = viewChild(ErrorSummaryComponent);
  protected readonly data = inject<NoteDialogData>(DIALOG_DATA);
  protected readonly guestFirstName = this.data.note.childName.split(' ')[0];
  protected readonly parentFirstName = this.data.note.parentName.split(' ')[0];
  protected readonly gift = signal(this.data.note.gift ?? '');
  protected readonly message = signal(this.data.note.message);
  /** Whether the parent has changed Giddy's wording. */
  protected readonly messageEdited = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly problem = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly description = computed(() =>
    this.data.note.canSend
      ? `Goes to ${this.parentFirstName} by email when you send the notes.`
      : `Giddy has no email for ${this.parentFirstName}, so this note won’t be sent.`,
  );

  protected editMessage(text: string): void {
    this.message.set(text);
    this.messageEdited.set(true);
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected async save(): Promise<void> {
    if (this.messageEdited() && !this.message().trim()) {
      this.showError(emptyMessage);
      return;
    }

    this.busy.set(true);
    this.error.set(null);
    this.problem.set(null);
    try {
      await firstValueFrom(
        this.api.saveNote(this.data.partyId, this.data.note.guestId, {
          gift: this.gift().trim() || null,
          message: this.messageEdited() ? this.message().trim() : null,
        }),
      );
      this.dialogRef.close(true);
    } catch (error) {
      const problem =
        error instanceof HttpErrorResponse ? (error.error as ApiProblem | null) : null;
      if (error instanceof HttpErrorResponse && error.status === 400 && problem?.errors) {
        this.showError(problem.errors['message']?.[0] ?? emptyMessage);
      } else {
        this.problem.set('The note wasn’t saved. Try again in a moment.');
      }
    } finally {
      this.busy.set(false);
    }
  }

  private showError(message: string): void {
    this.error.set(message);
    afterNextRender(() => this.summary()?.focus(), { injector: this.injector });
  }
}
