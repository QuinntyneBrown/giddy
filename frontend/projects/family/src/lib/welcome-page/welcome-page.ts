import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FAMILY_API, Interest } from '@giddy/api';
import {
  AvatarComponent,
  ButtonComponent,
  CardComponent,
  GiddyDialog,
  IconComponent,
} from '@giddy/components';
import { ResourceLoader, SessionStore, formatDate } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { ChildDialog } from '../child-dialog/child-dialog';
import { ChildDialogData } from '../child-dialog/child-dialog-data';
import { ChildDialogResult } from '../child-dialog/child-dialog-result';

/** Family setup after signing up: who are we celebrating? It can be skipped. */
@Component({
  imports: [RouterLink, AvatarComponent, ButtonComponent, CardComponent, IconComponent],
  templateUrl: './welcome-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomePage {
  private readonly api = inject(FAMILY_API);
  private readonly dialog = inject(GiddyDialog);
  protected readonly session = inject(SessionStore).session;
  protected readonly family = new ResourceLoader(() => this.api.get());
  private interests: Interest[] | null = null;

  protected turns(nextBirthday: string, age: number): string {
    return `Turns ${age} on ${formatDate(nextBirthday, true)}`;
  }

  protected async add(): Promise<void> {
    this.interests ??= await firstValueFrom(this.api.interests());
    this.dialog
      .open<ChildDialogResult, ChildDialogData, ChildDialog>(
        ChildDialog,
        { interests: this.interests, child: null },
        { autoFocus: '[data-initial-focus]' },
      )
      .closed.subscribe((result) => {
        if (result) this.family.reload();
      });
  }
}
