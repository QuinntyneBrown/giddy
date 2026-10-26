import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AlertComponent, ButtonComponent, DialogComponent } from '@giddy/components';
import { SyncConflict, TaskSync } from '@giddy/core';

/** Shows the parent's offline change beside a co-planner's and keeps the one they choose. */
@Component({
  imports: [AlertComponent, ButtonComponent, DialogComponent],
  templateUrl: './conflict-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConflictDialog {
  private readonly sync = inject(TaskSync);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  protected readonly conflict = inject<SyncConflict>(DIALOG_DATA);
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  /** "Kemi", from "Kemi changed this task while you were offline." */
  protected readonly who = computed(() => this.conflict.message.split(' ')[0]);

  protected async keep(which: 'mine' | 'theirs'): Promise<void> {
    this.busy.set(true);
    this.failed.set(false);
    try {
      await this.sync.resolve(this.conflict, which);
      this.dialogRef.close(true);
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
