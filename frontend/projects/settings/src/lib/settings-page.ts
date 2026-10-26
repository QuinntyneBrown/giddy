import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SignOutDialog } from '@giddy/account';
import { MEMORIES_API, Memory } from '@giddy/api';
import {
  ButtonComponent,
  GiddyDialog,
  CardComponent,
  EmptyStateComponent,
  RemovableChipComponent,
  SkeletonComponent,
} from '@giddy/components';
import { ResourceLoader, SessionStore } from '@giddy/core';
import { firstValueFrom } from 'rxjs';

/** Settings. For now: what Giddy remembers, with a way to forget each memory. */
@Component({
  imports: [
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    RemovableChipComponent,
    SkeletonComponent,
  ],
  templateUrl: './settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly api = inject(MEMORIES_API);
  private readonly dialog = inject(GiddyDialog);
  protected readonly session = inject(SessionStore).session;
  protected readonly memories = new ResourceLoader(
    () => this.api.list(),
    (memories) => memories.length === 0,
  );
  protected readonly subtitle = computed(() => {
    const session = this.session();
    return session ? `${session.name} · ${session.email}` : '';
  });

  protected async forget(memory: Memory): Promise<void> {
    await firstValueFrom(this.api.forget(memory.id));
    this.memories.reload();
  }

  protected signOut(): void {
    this.dialog.open<boolean, null, SignOutDialog>(SignOutDialog, null, {
      autoFocus: '[data-initial-focus]',
    });
  }
}
