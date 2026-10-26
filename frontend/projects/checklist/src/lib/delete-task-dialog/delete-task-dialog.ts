import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CHECKLIST_API } from '@giddy/api';
import { AlertComponent, ButtonComponent, DialogComponent } from '@giddy/components';
import { firstValueFrom } from 'rxjs';
import { DeleteTaskDialogData } from './delete-task-dialog-data';

/** Confirms deleting a task; Cancel is focused. Closes with true once deleted. */
@Component({
  imports: [AlertComponent, ButtonComponent, DialogComponent],
  templateUrl: './delete-task-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteTaskDialog {
  private readonly api = inject(CHECKLIST_API);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  protected readonly data = inject<DeleteTaskDialogData>(DIALOG_DATA);
  protected readonly state = signal<'idle' | 'busy' | 'failed'>('idle');

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected async remove(): Promise<void> {
    this.state.set('busy');
    try {
      await firstValueFrom(this.api.remove(this.data.partyId, this.data.task.id));
      this.dialogRef.close(true);
    } catch {
      this.state.set('failed');
    }
  }
}
