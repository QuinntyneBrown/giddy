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
import {
  BUDGET_API,
  Budget,
  BudgetLine,
  BudgetLineStatus,
  BudgetSwap,
  PARTIES_API,
} from '@giddy/api';
import {
  AlertComponent,
  BadgeComponent,
  BadgeTone,
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  EmptyStateComponent,
  GiddyDialog,
  IconComponent,
  LegendComponent,
  LegendItem,
  MeterComponent,
  MeterSegment,
  SkeletonComponent,
  StatComponent,
  TabNavComponent,
  TableItemComponent,
  TableWrapComponent,
  ToastComponent,
  ToastRegionComponent,
} from '@giddy/components';
import { GiddyMoneyPipe, ResourceLoader, formatMoney, partySections } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { CostDialog } from '../cost-dialog/cost-dialog';
import { CostDialogData } from '../cost-dialog/cost-dialog-data';
import { CostDialogResult } from '../cost-dialog/cost-dialog-result';
import { SwapDialog } from '../swap-dialog/swap-dialog';
import { SwapDialogData } from '../swap-dialog/swap-dialog-data';
import { BudgetToast } from './budget-toast';
import { categoryArt, otherArt } from './category-art';

const statusBadges: Record<BudgetLineStatus, { label: string; tone: BadgeTone }> = {
  estimate: { label: 'Estimate', tone: 'neutral' },
  quoted: { label: 'Quoted', tone: 'info' },
  booked: { label: 'Booked', tone: 'success' },
  depositPaid: { label: 'Deposit paid', tone: 'success' },
  paid: { label: 'Paid', tone: 'success' },
};

/** A party's budget: totals, spend by category, every cost, and Giddy's swaps when over. */
@Component({
  imports: [
    RouterLink,
    AlertComponent,
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    GiddyMoneyPipe,
    IconComponent,
    LegendComponent,
    MeterComponent,
    SkeletonComponent,
    StatComponent,
    TabNavComponent,
    TableItemComponent,
    TableWrapComponent,
    ToastComponent,
    ToastRegionComponent,
  ],
  templateUrl: './budget-page.html',
  styleUrl: './budget-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetPage {
  private readonly budgetApi = inject(BUDGET_API);
  private readonly partiesApi = inject(PARTIES_API);
  private readonly dialog = inject(GiddyDialog);
  private nextToast = 0;

  /** From the route. */
  readonly partyId = input.required<string>();

  protected readonly party = new ResourceLoader(
    () => this.partiesApi.overview(this.partyId()),
    () => false,
    false,
  );
  protected readonly budget = new ResourceLoader(
    () => this.budgetApi.get(this.partyId()),
    (budget) => budget.lines.length === 0,
    false,
  );
  protected readonly toasts = signal<BudgetToast[]>([]);
  protected readonly estimating = signal(false);

  protected readonly canPlan = computed(() => {
    const party = this.party.value();
    return !!party && party.role !== 'viewer' && !party.locked;
  });
  protected readonly sections = computed(() => partySections(this.partyId()));
  protected readonly breadcrumb = computed(() => [
    { label: 'My parties', link: '/parties' },
    { label: this.party.value()?.name ?? 'Party', link: `/parties/${this.partyId()}` },
    { label: 'Budget' },
  ]);
  protected readonly subtitle = computed(() => {
    const budget = this.budget.value();
    if (!budget) return '';
    if (!budget.lines.length)
      return budget.budget !== null
        ? `${formatMoney(budget.budget)} budget · nothing planned yet`
        : 'Nothing planned yet';
    const of = budget.budget !== null ? ` of ${formatMoney(budget.budget)}` : '';
    return `${formatMoney(budget.planned)} planned${of} · ${formatMoney(budget.paid)} paid`;
  });
  protected readonly status = computed(() => {
    const budget = this.budget.value();
    if (!budget || budget.left === null) return null;
    return budget.over
      ? { label: `${formatMoney(budget.overBy)} over`, tone: 'danger' as const }
      : { label: `${formatMoney(budget.left)} left`, tone: 'success' as const };
  });
  /** Segments share the larger of the budget and the plan, so an over-budget bar is full. */
  protected readonly segments = computed<MeterSegment[]>(() => {
    const budget = this.budget.value();
    if (!budget) return [];
    const whole = Math.max(budget.budget ?? 0, budget.planned);
    return budget.categories.map((c) => ({
      percent: whole ? (c.amount / whole) * 100 : 0,
      pop: this.art(c.category).pop,
    }));
  });
  protected readonly legend = computed<LegendItem[]>(() =>
    (this.budget.value()?.categories ?? []).map((c) => ({
      label: `${c.category} ${formatMoney(c.amount)}`,
      pop: this.art(c.category).pop,
    })),
  );
  protected readonly meterLabel = computed(() => {
    const budget = this.budget.value();
    if (!budget) return '';
    return budget.budget !== null
      ? `${formatMoney(budget.planned)} planned of ${formatMoney(budget.budget)} budget`
      : `${formatMoney(budget.planned)} planned`;
  });

  constructor() {
    effect(() => {
      this.partyId();
      untracked(() => {
        this.party.reload();
        this.budget.reload();
      });
    });
  }

  protected art(category: string) {
    return categoryArt[category] ?? otherArt;
  }

  protected badge(line: BudgetLine) {
    return statusBadges[line.status];
  }

  protected openAdd(): void {
    this.openCost(null);
  }

  protected openEdit(line: BudgetLine): void {
    this.openCost(line);
  }

  protected openSwap(swap: BudgetSwap): void {
    const ref = this.dialog.open<Budget, SwapDialogData, SwapDialog>(
      SwapDialog,
      { partyId: this.partyId(), swap },
      { autoFocus: '[data-initial-focus]' },
    );
    ref.closed.subscribe((budget) => {
      if (!budget) return;
      this.budget.reload();
      this.show({
        heading: `Swapped to ${swap.replacementName}`,
        text: budget.over
          ? `Still ${formatMoney(budget.overBy)} over budget.`
          : `You’re back within budget with ${formatMoney(budget.left ?? 0)} left.`,
        tone: 'success',
      });
    });
  }

  protected async estimate(): Promise<void> {
    this.estimating.set(true);
    try {
      await firstValueFrom(this.budgetApi.estimate(this.partyId()));
      this.budget.reload();
    } catch {
      this.show({
        heading: 'Giddy couldn’t fill in the budget',
        text: 'Nothing was changed. Try again in a moment.',
        tone: 'danger',
        persistent: true,
      });
    } finally {
      this.estimating.set(false);
    }
  }

  protected dismiss(id: number): void {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  private openCost(cost: BudgetLine | null): void {
    const budget = this.budget.value();
    const ref = this.dialog.open<CostDialogResult, CostDialogData, CostDialog>(
      CostDialog,
      {
        partyId: this.partyId(),
        budget: budget?.budget ?? null,
        planned: budget?.planned ?? 0,
        cost,
      },
      { autoFocus: '[data-initial-focus]' },
    );
    ref.closed.subscribe((result) => {
      if (!result) return;
      this.budget.reload();
      this.show({
        heading: `${result.name} ${result.outcome}`,
        text: 'The totals are up to date.',
        tone: result.outcome === 'removed' ? 'neutral' : 'success',
      });
    });
  }

  private show(toast: Omit<BudgetToast, 'id' | 'persistent'> & { persistent?: boolean }): void {
    const id = this.nextToast++;
    this.toasts.update((toasts) => [...toasts, { persistent: false, ...toast, id }]);
  }
}
