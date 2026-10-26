import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ApiProblem, CHECKLIST_API, GiddyDidTask } from '@giddy/api';
import { AlertComponent, ButtonComponent, DialogComponent } from '@giddy/components';
import { firstValueFrom } from 'rxjs';
import { GiddyDoDialogData } from './giddy-do-dialog-data';

/** Says exactly what Giddy will send before it does a task; Cancel is focused. */
@Component({
  imports: [AlertComponent, ButtonComponent, DialogComponent],
  templateUrl: './giddy-do-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GiddyDoDialog {
  private readonly api = inject(CHECKLIST_API);
  private readonly dialogRef = inject<DialogRef<GiddyDidTask>>(DialogRef);
  protected readonly data = inject<GiddyDoDialogData>(DIALOG_DATA);
  protected readonly busy = signal(false);
  protected readonly problem = signal<string | null>(null);
  protected readonly copy = computed(() =>
    this.data.task.giddyCanDo === 'allergyList'
      ? {
          heading: 'Send the allergy list?',
          text: `Giddy will send ${this.data.venueName ?? 'your venue'} each child’s first name and allergy, with no contact details, and tick this off.`,
        }
      : {
          heading: 'Send RSVP reminders?',
          text: 'Giddy will remind every family who hasn’t replied, by email and text where it can, and tick this off.',
        },
  );

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected async confirm(): Promise<void> {
    this.busy.set(true);
    this.problem.set(null);
    try {
      this.dialogRef.close(
        await firstValueFrom(this.api.letGiddyDo(this.data.partyId, this.data.task.id)),
      );
    } catch (error) {
      this.problem.set(
        error instanceof HttpErrorResponse && error.status === 409
          ? (error.error as ApiProblem).title
          : 'Nothing was sent. Try again in a moment.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}
