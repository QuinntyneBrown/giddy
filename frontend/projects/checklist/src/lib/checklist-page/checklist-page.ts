import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CHECKLIST_API, ChecklistTask, GiddyDidTask, PARTIES_API } from '@giddy/api';
import {
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  EmptyStateComponent,
  GiddyDialog,
  IconComponent,
  MenuButtonComponent,
  MenuItem,
  ProgressComponent,
  SkeletonComponent,
  TabNavComponent,
  TaskComponent,
  ToastComponent,
  ToastRegionComponent,
} from '@giddy/components';
import {
  ConnectionStatus,
  LiveUpdates,
  OfflineCache,
  ResourceLoader,
  TaskSync,
  formatDate,
  partySections,
  torontoToday,
} from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { DeleteTaskDialog } from '../delete-task-dialog/delete-task-dialog';
import { DeleteTaskDialogData } from '../delete-task-dialog/delete-task-dialog-data';
import { GiddyDoDialog } from '../giddy-do-dialog/giddy-do-dialog';
import { GiddyDoDialogData } from '../giddy-do-dialog/giddy-do-dialog-data';
import { TaskDialog } from '../task-dialog/task-dialog';
import { TaskDialogData } from '../task-dialog/task-dialog-data';
import { ChecklistToast } from './checklist-toast';
import { withTick } from './with-tick';

/** A party's dated checklist: what's overdue, due this week, before the party, and done. */
@Component({
  imports: [
    RouterLink,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    IconComponent,
    MenuButtonComponent,
    ProgressComponent,
    SkeletonComponent,
    TabNavComponent,
    TaskComponent,
    ToastComponent,
    ToastRegionComponent,
  ],
  templateUrl: './checklist-page.html',
  styleUrl: './checklist-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChecklistPage {
  private readonly checklistApi = inject(CHECKLIST_API);
  private readonly partiesApi = inject(PARTIES_API);
  private readonly dialog = inject(GiddyDialog);
  private readonly cache = inject(OfflineCache);
  private readonly connection = inject(ConnectionStatus);
  private readonly sync = inject(TaskSync);
  private nextToast = 0;

  /** From the route. */
  readonly partyId = input.required<string>();

  protected readonly party = new ResourceLoader(
    () => this.cache.load(`overview:${this.partyId()}`, this.partiesApi.overview(this.partyId())),
    () => false,
    false,
  );
  protected readonly checklist = new ResourceLoader(
    () => this.cache.load(this.cacheKey(), this.checklistApi.get(this.partyId())),
    (checklist) => checklist.total === 0,
    false,
  );
  protected readonly toasts = signal<ChecklistToast[]>([]);
  protected readonly making = signal(false);

  protected readonly canPlan = computed(() => {
    const party = this.party.value();
    return !!party && party.role !== 'viewer' && !party.locked;
  });
  protected readonly sections = computed(() => partySections(this.partyId()));
  protected readonly breadcrumb = computed(() => [
    { label: 'My parties', link: '/parties' },
    { label: this.party.value()?.name ?? 'Party', link: `/parties/${this.partyId()}` },
    { label: 'Checklist' },
  ]);
  protected readonly subtitle = computed(() => {
    const checklist = this.checklist.value();
    if (!checklist) return '';
    if (!checklist.total) return 'Nothing to do yet';
    const parts = [`${checklist.done} of ${checklist.total} done`, `${checklist.overdue} overdue`];
    if (checklist.next) parts.push(`next: ${checklist.next}`);
    return parts.join(' · ');
  });
  /** Groups with tasks in them, headed like "Overdue · 1". */
  protected readonly groups = computed(() =>
    (this.checklist.value()?.groups ?? [])
      .filter((g) => g.tasks.length)
      .map((g) => ({ ...g, heading: `${g.name} · ${g.tasks.length}` })),
  );
  protected readonly allDone = computed(() => {
    const checklist = this.checklist.value();
    return !!checklist && checklist.total > 0 && checklist.done === checklist.total;
  });
  protected readonly celebration = computed(() => {
    const child = this.party.value()?.childName;
    return child
      ? `Everything’s ready for ${child}’s big day!`
      : 'Everything’s ready for the big day!';
  });
  protected readonly emptyText = computed(() => {
    const date = this.checklist.value()?.partyDate;
    return `Giddy can build a dated checklist from your plan, working back from ${date ? formatDate(date) : 'the party'}, with reminders so nothing sneaks up on you.`;
  });

  constructor() {
    effect(() => {
      this.partyId();
      untracked(() => {
        this.party.reload();
        this.checklist.reload();
      });
    });
    const live = inject(LiveUpdates);
    effect(() => {
      if (live.version() > 0) untracked(() => this.checklist.reload());
    });
    effect(() => {
      if (this.sync.changes() > 0) untracked(() => this.checklist.reload());
    });
  }

  protected due(task: ChecklistTask): string {
    const when = task.done
      ? `Done ${formatDate(task.doneOn ?? task.due)}`
      : task.overdue
        ? `Overdue · was due ${formatDate(task.due)}`
        : formatDate(task.due);
    const owner = this.checklist.value()?.planners.find((p) => p.parentId === task.ownerId);
    return owner && !owner.isYou ? `${when} · ${owner.name.split(' ')[0]}` : when;
  }

  protected menu(task: ChecklistTask): MenuItem[] {
    return [
      { id: 'edit', label: 'Edit task', icon: 'edit' },
      ...(task.giddyCanDo
        ? [{ id: 'giddy', label: 'Let Giddy do it', icon: 'sparkle' as const }]
        : []),
      { id: 'delete', label: 'Delete task', icon: 'trash', danger: true },
    ];
  }

  protected act(task: ChecklistTask, action: string): void {
    if (action === 'edit') this.openTask(task);
    else if (action === 'giddy') this.letGiddyDo(task);
    else if (action === 'delete') this.confirmDelete(task);
  }

  protected async setDone(task: ChecklistTask, done: boolean): Promise<void> {
    if (!this.connection.online()) {
      // Saved on the device and sent with the version the parent saw when the connection returns.
      const ticked = withTick(this.checklist.value()!, task.id, done, torontoToday());
      this.checklist.update(ticked);
      await this.cache.save(this.cacheKey(), ticked);
      await this.sync.queue({
        partyId: this.partyId(),
        taskId: task.id,
        title: task.title,
        done,
        version: task.version,
      });
      return;
    }
    try {
      await firstValueFrom(this.checklistApi.setDone(this.partyId(), task.id, done));
    } catch {
      this.show({
        heading: 'That didn’t save',
        text: `“${task.title}” is as it was. Try again in a moment.`,
        tone: 'danger',
        persistent: true,
      });
    }
    this.checklist.reload();
  }

  protected openTask(task: ChecklistTask | null = null): void {
    const checklist = this.checklist.value();
    const ref = this.dialog.open<ChecklistTask, TaskDialogData, TaskDialog>(
      TaskDialog,
      {
        partyId: this.partyId(),
        partyDate: checklist?.partyDate ?? this.party.value()?.date ?? '',
        planners: checklist?.planners ?? [],
        task,
      },
      { autoFocus: '[data-initial-focus]' },
    );
    ref.closed.subscribe((saved) => {
      if (!saved) return;
      this.checklist.reload();
      this.show({
        heading: task ? 'Task saved' : 'Task added',
        text: `“${saved.title}” is due ${formatDate(saved.due)}.`,
        tone: 'success',
      });
    });
  }

  protected async make(): Promise<void> {
    this.making.set(true);
    try {
      await firstValueFrom(this.checklistApi.generate(this.partyId()));
      this.checklist.reload();
    } catch {
      this.show({
        heading: 'Giddy couldn’t make the checklist',
        text: 'Nothing was changed. Try again in a moment.',
        tone: 'danger',
        persistent: true,
      });
    } finally {
      this.making.set(false);
    }
  }

  protected dismiss(id: number): void {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  private cacheKey(): string {
    return `checklist:${this.partyId()}`;
  }

  private letGiddyDo(task: ChecklistTask): void {
    const ref = this.dialog.open<GiddyDidTask, GiddyDoDialogData, GiddyDoDialog>(
      GiddyDoDialog,
      { partyId: this.partyId(), task, venueName: this.party.value()?.venueName ?? null },
      { autoFocus: '[data-initial-focus]' },
    );
    ref.closed.subscribe((did) => {
      if (!did) return;
      this.checklist.reload();
      this.show({ heading: did.message, text: `“${task.title}” is ticked off.`, tone: 'success' });
    });
  }

  private confirmDelete(task: ChecklistTask): void {
    const ref = this.dialog.open<boolean, DeleteTaskDialogData, DeleteTaskDialog>(
      DeleteTaskDialog,
      { partyId: this.partyId(), task },
      { autoFocus: '[data-initial-focus]' },
    );
    ref.closed.subscribe((deleted) => {
      if (!deleted) return;
      this.checklist.reload();
      this.show({
        heading: 'Task deleted',
        text: `“${task.title}” is off the checklist.`,
        tone: 'neutral',
      });
    });
  }

  private show(toast: Omit<ChecklistToast, 'id' | 'persistent'> & { persistent?: boolean }): void {
    const id = this.nextToast++;
    this.toasts.update((toasts) => [...toasts, { persistent: false, ...toast, id }]);
  }
}
