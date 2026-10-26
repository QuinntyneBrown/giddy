import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BUDGET_API, Budget } from '@giddy/api';
import { AlertComponent, ButtonComponent, DialogComponent } from '@giddy/components';
import { GiddyMoneyPipe } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { SwapDialogData } from './swap-dialog-data';

/** Confirms one of Giddy's swaps; Keep the plan is focused. Closes with the updated budget. */
@Component({
  imports: [AlertComponent, ButtonComponent, DialogComponent, GiddyMoneyPipe],
  templateUrl: './swap-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwapDialog {
  private readonly api = inject(BUDGET_API);
  private readonly dialogRef = inject<DialogRef<Budget>>(DialogRef);
  protected readonly data = inject<SwapDialogData>(DIALOG_DATA);
  protected readonly state = signal<'idle' | 'busy' | 'failed'>('idle');

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected async confirm(): Promise<void> {
    this.state.set('busy');
    try {
      const { partyId, swap } = this.data;
      this.dialogRef.close(
        await firstValueFrom(this.api.swap(partyId, swap.category, swap.replacementId)),
      );
    } catch {
      this.state.set('failed');
    }
  }
}
