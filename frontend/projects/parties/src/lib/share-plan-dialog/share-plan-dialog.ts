import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PartyRole, PlanMember, SHARING_API } from '@giddy/api';
import {
  AlertComponent,
  AvatarComponent,
  ButtonComponent,
  ChoiceComponent,
  DialogComponent,
  FormFieldComponent,
  InputDirective,
} from '@giddy/components';
import { ResourceLoader, isEmail } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { SharePlanData } from './share-plan-data';

const roleNames: Record<PartyRole, string> = {
  owner: 'Owner',
  coPlanner: 'Can edit',
  viewer: 'Can view',
};

/** Invites planners by email with a role, lists who is planning, and shares a view-only link. */
@Component({
  imports: [
    AlertComponent,
    AvatarComponent,
    ButtonComponent,
    ChoiceComponent,
    DialogComponent,
    FormFieldComponent,
    InputDirective,
  ],
  templateUrl: './share-plan-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharePlanDialog {
  private readonly api = inject(SHARING_API);
  private readonly dialogRef = inject(DialogRef);
  protected readonly data = inject<SharePlanData>(DIALOG_DATA);
  protected readonly members = new ResourceLoader(() => this.api.members(this.data.partyId));
  protected readonly email = signal('');
  protected readonly role = signal<PartyRole>('coPlanner');
  protected readonly error = signal<string | null>(null);
  protected readonly status = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly link = signal<string | null>(null);
  protected readonly heading = computed(() =>
    this.data.childName ? `Share ${this.data.childName}’s party plan` : 'Share the party plan',
  );

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected roleName(member: PlanMember): string {
    return roleNames[member.role];
  }

  protected async invite(): Promise<void> {
    if (!isEmail(this.email())) {
      this.error.set('Enter an email address like name@example.com');
      return;
    }

    this.busy.set(true);
    this.error.set(null);
    this.status.set(null);
    try {
      const address = this.email().trim();
      await firstValueFrom(this.api.invite(this.data.partyId, address, this.role()));
      this.status.set(`Invitation sent to ${address}`);
      this.email.set('');
      this.members.reload();
    } catch (error) {
      this.error.set(
        error instanceof HttpErrorResponse && error.status === 400
          ? 'Enter an email address like name@example.com'
          : null,
      );
      if (!this.error()) this.status.set('The invitation didn’t send. Try again in a moment.');
    } finally {
      this.busy.set(false);
    }
  }

  protected async remove(member: PlanMember): Promise<void> {
    this.status.set(null);
    try {
      await firstValueFrom(this.api.remove(this.data.partyId, member.parentId));
      this.status.set(`${member.name} can no longer see this party`);
      this.members.reload();
    } catch {
      this.status.set(`${member.name} wasn’t removed. Try again in a moment.`);
    }
  }

  protected async copyLink(): Promise<void> {
    this.status.set(null);
    try {
      const { url } = await firstValueFrom(this.api.shareLink(this.data.partyId));
      const absolute = `${location.origin}${url}`;
      this.link.set(absolute);
      await navigator.clipboard?.writeText(absolute).catch(() => undefined);
      this.status.set('Link copied. Anyone with it can see a summary, without guests’ details.');
    } catch {
      this.status.set('We couldn’t make a link. Try again in a moment.');
    }
  }
}
