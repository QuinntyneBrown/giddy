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
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PARTIES_API, THEMES_API, Theme, ThemeChange } from '@giddy/api';
import {
  ButtonComponent,
  ChipComponent,
  EmptyStateComponent,
  IconComponent,
  PopColour,
  SkeletonComponent,
  TileComponent,
  ToastComponent,
  ToastRegionComponent,
} from '@giddy/components';
import { ResourceLoader, pickParty } from '@giddy/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import { ageBands } from './age-bands';

const pops: PopColour[] = ['mint', 'grape', 'sky', 'pink', 'orange', 'sun'];

/** Themes that suit the party's child, filtered by age, outdoor and budget; choose one with Undo. */
@Component({
  imports: [
    RouterLink,
    ButtonComponent,
    ChipComponent,
    EmptyStateComponent,
    IconComponent,
    SkeletonComponent,
    TileComponent,
    ToastComponent,
    ToastRegionComponent,
  ],
  templateUrl: './themes-page.html',
  styleUrl: './themes-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemesPage {
  private readonly api = inject(THEMES_API);
  private readonly parties = toSignal(
    inject(PARTIES_API)
      .mine()
      .pipe(catchError(() => of([]))),
  );

  /** From the query string. */
  readonly partyId = input<string>();

  protected readonly ageBands = ageBands;
  protected readonly forChild = signal(true);
  protected readonly ageBand = signal<string | null>(null);
  protected readonly outdoor = signal(false);
  protected readonly budget = signal(false);
  protected readonly choosing = signal<string | null>(null);
  protected readonly undoOffer = signal<{ heading: string; change: ThemeChange } | null>(null);
  private undoTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly party = computed(() => {
    const parties = this.parties();
    return parties ? pickParty(parties, this.partyId()) : null;
  });
  protected readonly themes = new ResourceLoader(
    () =>
      this.api.list(this.party()?.id ?? null, {
        forChild: this.forChild(),
        ageBand: this.ageBand(),
        outdoor: this.outdoor(),
        budget: this.budget(),
      }),
    (list) => list.results.length === 0,
    false,
  );
  protected readonly child = computed(() => this.themes.value()?.child ?? null);
  protected readonly canChoose = computed(() => {
    const party = this.party();
    return !!party && party.role !== 'viewer' && !party.locked;
  });
  protected readonly subtitle = computed(() => {
    const list = this.themes.value();
    if (!list) return '';
    const total = `${list.total} themes`;
    return list.forChild && list.child
      ? `${total} · ${list.results.length} for ${list.child.name}’s age`
      : `${total} · ${list.results.length} shown`;
  });

  constructor() {
    effect(() => {
      if (this.parties() === undefined) return;
      this.party();
      this.forChild();
      this.ageBand();
      this.outdoor();
      this.budget();
      untracked(() => this.themes.reload());
    });
  }

  protected pop(index: number): PopColour {
    return pops[index % pops.length];
  }

  protected badge(theme: Theme): string | null {
    const child = this.child()?.name;
    if (theme.matchesInterests && child) return `${child} might love`;
    return null;
  }

  protected chooseBand(band: string): void {
    this.ageBand.update((current) => (current === band ? null : band));
  }

  protected clearFilters(): void {
    this.forChild.set(false);
    this.ageBand.set(null);
    this.outdoor.set(false);
    this.budget.set(false);
  }

  protected async use(theme: Theme): Promise<void> {
    const party = this.party();
    if (!party) return;
    this.choosing.set(theme.id);
    try {
      const change = await firstValueFrom(this.api.choose(party.id, theme.id));
      this.themes.reload();
      const child = this.child()?.name;
      this.offerUndo(`${theme.name} is ${child ? `${child}’s` : 'the party’s'} theme`, change);
    } finally {
      this.choosing.set(null);
    }
  }

  protected async undo(): Promise<void> {
    const offer = this.undoOffer();
    const party = this.party();
    if (!offer || !party) return;
    this.dismissUndo();
    await firstValueFrom(this.api.choose(party.id, offer.change.previous?.id ?? null));
    this.themes.reload();
  }

  protected dismissUndo(): void {
    clearTimeout(this.undoTimer);
    this.undoOffer.set(null);
  }

  private offerUndo(heading: string, change: ThemeChange): void {
    clearTimeout(this.undoTimer);
    this.undoOffer.set({ heading, change });
    this.undoTimer = setTimeout(() => this.undoOffer.set(null), 8000);
  }
}
