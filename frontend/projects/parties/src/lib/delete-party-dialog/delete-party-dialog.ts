import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PARTIES_API } from '@giddy/api';
import {
  AlertComponent,
  ButtonComponent,
  DialogComponent,
  FormFieldComponent,
  InputDirective,
} from '@giddy/components';
import { firstValueFrom } from 'rxjs';
import { DeletePartyData } from './delete-party-data';

/**
 * Deleting a party in two steps: what will be lost (Cancel focused), then typing the exact name.
 * Closes with true once the party is deleted.
 */
@Component({
  imports: [AlertComponent, ButtonComponent, DialogComponent, FormFieldComponent, InputDirective],
  templateUrl: './delete-party-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeletePartyDialog {
  private readonly api = inject(PARTIES_API);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  protected readonly data = inject<DeletePartyData>(DIALOG_DATA);
  protected readonly step = signal<'consequences' | 'confirm'>('consequences');
  protected readonly typed = signal('');
  protected readonly mismatch = signal(false);
  protected readonly state = signal<'idle' | 'busy' | 'failed'>('idle');
  protected readonly bookingNames = computed(() =>
    this.data.confirmedBookings.map((b) => b.name).join(' and '),
  );

  protected continue(): void {
    this.step.set('confirm');
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected type(value: string): void {
    this.typed.set(value);
    this.mismatch.set(false);
  }

  protected async delete(): Promise<void> {
    if (this.typed().trim() !== this.data.partyName) {
      this.mismatch.set(true);
      return;
    }

    this.state.set('busy');
    try {
      await firstValueFrom(this.api.delete(this.data.partyId));
      this.dialogRef.close(true);
    } catch {
      this.state.set('failed');
    }
  }
}
