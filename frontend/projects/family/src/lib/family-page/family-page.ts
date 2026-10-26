import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Child, FAMILY_API, Interest } from '@giddy/api';
import {
  AvatarComponent,
  ButtonComponent,
  CardComponent,
  ChipComponent,
  EmptyStateComponent,
  GiddyDialog,
  IconComponent,
  SkeletonComponent,
  ToastComponent,
  ToastRegionComponent,
} from '@giddy/components';
import { ResourceLoader, SessionStore, formatDate, formatRelativeDays } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { ChildDialog } from '../child-dialog/child-dialog';
import { ChildDialogData } from '../child-dialog/child-dialog-data';
import { ChildDialogResult } from '../child-dialog/child-dialog-result';

/** The family: each child's next birthday, interests, allergies and party, and the grown-ups. */
@Component({
  imports: [
    RouterLink,
    AvatarComponent,
    ButtonComponent,
    CardComponent,
    ChipComponent,
    EmptyStateComponent,
    IconComponent,
    SkeletonComponent,
    ToastComponent,
    ToastRegionComponent,
  ],
  templateUrl: './family-page.html',
  styleUrl: './family-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FamilyPage {
  private readonly api = inject(FAMILY_API);
  private readonly dialog = inject(GiddyDialog);
  protected readonly session = inject(SessionStore).session;
  protected readonly family = new ResourceLoader(
    () => this.api.get(),
    (family) => family.children.length === 0,
  );
  private interests: Interest[] | null = null;
  protected readonly toast = signal<string | null>(null);
  protected readonly subtitle = computed(() => {
    const count = this.family.value()?.children.length ?? 0;
    return count === 0 ? 'No kids added yet' : count === 1 ? '1 kid' : `${count} kids`;
  });

  protected birthdayLine(child: Child): string {
    return `Turns ${child.turningAge} on ${formatDate(child.nextBirthday, true)} · ${formatRelativeDays(child.daysUntil)}`;
  }

  protected emoji(name: string): string {
    return this.interests?.find((i) => i.name === name)?.emoji ?? '✨';
  }

  protected async open(child: Child | null = null): Promise<void> {
    this.interests ??= await firstValueFrom(this.api.interests());
    const ref = this.dialog.open<ChildDialogResult, ChildDialogData, ChildDialog>(
      ChildDialog,
      { interests: this.interests, child },
      { autoFocus: '[data-initial-focus]' },
    );
    ref.closed.subscribe((result) => {
      if (!result) return;
      this.family.reload();
      this.toast.set(
        result.child
          ? `${result.name} is ${child ? 'updated' : 'in the family'}`
          : `${result.name} is no longer in the family`,
      );
    });
  }

  constructor() {
    void firstValueFrom(this.api.interests()).then((list) => (this.interests = list));
  }
}
