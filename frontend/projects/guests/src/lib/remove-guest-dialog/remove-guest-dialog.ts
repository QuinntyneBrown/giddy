import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { GUESTS_API } from '@giddy/api';
import { AlertComponent, ButtonComponent, DialogComponent } from '@giddy/components';
import { firstValueFrom } from 'rxjs';
import { RemoveGuestData } from './remove-guest-data';

/** Confirms removing a guest; Cancel is focused. Closes with true once removed. */
@Component({
  imports: [AlertComponent, ButtonComponent, DialogComponent],
  templateUrl: './remove-guest-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemoveGuestDialog {
  private readonly api = inject(GUESTS_API);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  protected readonly data = inject<RemoveGuestData>(DIALOG_DATA);
  protected readonly state = signal<'idle' | 'busy' | 'failed'>('idle');

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected async remove(): Promise<void> {
    this.state.set('busy');
    try {
      await firstValueFrom(this.api.remove(this.data.partyId, this.data.guest.id));
      this.dialogRef.close(true);
    } catch {
      this.state.set('failed');
    }
  }
}
