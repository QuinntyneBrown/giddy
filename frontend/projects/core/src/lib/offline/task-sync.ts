import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, effect, inject, signal, untracked } from '@angular/core';
import { ApiProblem, CHECKLIST_API, ChecklistTask } from '@giddy/api';
import { firstValueFrom } from 'rxjs';
import { ConnectionStatus } from '../connection/connection-status';
import { OfflineStore } from './offline-store';
import { SyncConflict } from './sync-conflict';
import { SyncResult } from './sync-result';
import { TaskChange } from './task-change';

const outboxKey = 'outbox';

/**
 * Checklist ticks made offline. They wait on the device and are sent, each with the version the
 * parent saw, as soon as the connection returns. A tick on a task a co-planner changed meanwhile
 * comes back as a conflict for the parent to resolve.
 */
@Injectable({ providedIn: 'root' })
export class TaskSync {
  private readonly api = inject(CHECKLIST_API);
  private readonly store = inject(OfflineStore);
  private readonly connection = inject(ConnectionStatus);
  private readonly outbox = signal<TaskChange[]>([]);
  private readonly lastResult = signal<SyncResult | null>(null);
  private readonly open = signal<SyncConflict[]>([]);
  private readonly sending = signal(false);
  private readonly changeCount = signal(0);

  readonly pending = this.outbox.asReadonly();
  readonly result = this.lastResult.asReadonly();
  readonly conflicts = this.open.asReadonly();
  readonly syncing = this.sending.asReadonly();
  /** Increases whenever synced changes land on the server, so pages can reload. */
  readonly changes = this.changeCount.asReadonly();

  constructor() {
    void this.store.get<TaskChange[]>(outboxKey).then((saved) => {
      if (saved?.length) this.outbox.set(saved);
    });
    effect(() => {
      if (this.connection.online() && this.outbox().length) untracked(() => void this.sync());
    });
  }

  async queue(change: TaskChange): Promise<void> {
    this.lastResult.set(null);
    this.outbox.update((changes) => [...changes.filter((c) => c.taskId !== change.taskId), change]);
    await this.store.set(outboxKey, this.outbox());
  }

  async sync(): Promise<void> {
    if (this.sending() || !this.outbox().length) return;
    this.sending.set(true);
    let synced = 0;
    const conflicts: SyncConflict[] = [];
    const remaining: TaskChange[] = [];
    for (const change of this.outbox()) {
      try {
        await firstValueFrom(
          this.api.setDone(change.partyId, change.taskId, change.done, change.version),
        );
        synced++;
      } catch (error) {
        if (error instanceof HttpErrorResponse && error.status === 412) {
          const problem = error.error as ApiProblem & { current: ChecklistTask };
          conflicts.push({ change, message: problem.title, current: problem.current });
        } else if (error instanceof HttpErrorResponse && error.status === 0) {
          remaining.push(change);
        }
      }
    }
    this.outbox.set(remaining);
    await this.store.set(outboxKey, remaining);
    this.open.update((open) => [...open, ...conflicts]);
    this.lastResult.set({ synced, conflicts: conflicts.length });
    this.sending.set(false);
    if (synced) this.changeCount.update((n) => n + 1);
  }

  /** Keeps the parent's tick over the co-planner's version, or drops it. */
  async resolve(conflict: SyncConflict, keep: 'mine' | 'theirs'): Promise<void> {
    if (keep === 'mine') {
      const { partyId, taskId, done } = conflict.change;
      await firstValueFrom(this.api.setDone(partyId, taskId, done, conflict.current.version));
    }
    this.open.update((open) => open.filter((c) => c !== conflict));
    this.changeCount.update((n) => n + 1);
  }

  dismissResult(): void {
    this.lastResult.set(null);
  }
}
