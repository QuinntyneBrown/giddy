import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PARTIES_API, PlanApplied } from '@giddy/api';
import { AlertComponent, ButtonComponent, DialogComponent, IconComponent } from '@giddy/components';
import { formatDate, formatMoney } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { AcceptPlanData } from './accept-plan-data';

/** The number of dated tasks the plan's checklist creates. */
const checklistSteps = 10;

/** Confirms Giddy's plan: lists every change, says nothing is booked or paid, then saves it. */
@Component({
  imports: [AlertComponent, ButtonComponent, DialogComponent, IconComponent],
  templateUrl: './accept-plan-dialog.html',
  styleUrl: './accept-plan-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcceptPlanDialog {
  private readonly api = inject(PARTIES_API);
  private readonly dialogRef = inject<DialogRef<PlanApplied>>(DialogRef);
  protected readonly data = inject<AcceptPlanData>(DIALOG_DATA);
  protected readonly state = signal<'idle' | 'busy' | 'failed'>('idle');

  protected readonly childName = computed(() => this.data.party.childName ?? this.data.party.name);
  protected readonly bookings = computed(() => {
    const names = this.data.proposal.items.map((item) => item.name);
    return names.length > 1
      ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
      : (names[0] ?? '');
  });
  protected readonly estimates = computed(() => formatMoney(this.data.proposal.total));
  protected readonly partyDate = computed(() => formatDate(this.data.party.date));
  protected readonly checklistSteps = checklistSteps;

  protected async confirm(): Promise<void> {
    this.state.set('busy');
    try {
      const applied = await firstValueFrom(
        this.api.applyPlan(this.data.party.partyId, this.data.proposal.id),
      );
      this.dialogRef.close(applied);
    } catch {
      this.state.set('failed');
    }
  }

  protected cancel(): void {
    this.dialogRef.close();
  }
}
