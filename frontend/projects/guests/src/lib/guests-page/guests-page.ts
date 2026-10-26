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
import { GUESTS_API, Guest, PARTIES_API, RsvpStatus } from '@giddy/api';
import {
  AllergyTagComponent,
  AvatarComponent,
  BadgeComponent,
  BadgeTone,
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  ChoiceComponent,
  EmptyStateComponent,
  IconComponent,
  SkeletonComponent,
  TabNavComponent,
  TableWrapComponent,
  TallyComponent,
  ToastComponent,
  ToastRegionComponent,
} from '@giddy/components';
import { ResourceLoader, joinNames, partySections } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { PageToast } from './page-toast';

const rsvpBadges: Record<RsvpStatus, { label: string; tone: BadgeTone }> = {
  coming: { label: 'Coming', tone: 'success' },
  waiting: { label: 'Waiting', tone: 'warning' },
  cantCome: { label: 'Can’t come', tone: 'neutral' },
  notSent: { label: 'Not sent', tone: 'info' },
};

/** A party's guest list: replies, counts, the allergy list for the venue, and reminders. */
@Component({
  imports: [
    RouterLink,
    AllergyTagComponent,
    AvatarComponent,
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    ChoiceComponent,
    EmptyStateComponent,
    IconComponent,
    SkeletonComponent,
    TabNavComponent,
    TableWrapComponent,
    TallyComponent,
    ToastComponent,
    ToastRegionComponent,
  ],
  templateUrl: './guests-page.html',
  styleUrl: './guests-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestsPage {
  private readonly guestsApi = inject(GUESTS_API);
  private readonly partiesApi = inject(PARTIES_API);
  private nextToast = 0;

  /** From the route. */
  readonly partyId = input.required<string>();

  protected readonly party = new ResourceLoader(
    () => this.partiesApi.overview(this.partyId()),
    () => false,
    false,
  );
  protected readonly list = new ResourceLoader(
    () => this.guestsApi.list(this.partyId()),
    (list) => list.guests.length === 0,
    false,
  );
  protected readonly selected = signal<string[]>([]);
  protected readonly toasts = signal<PageToast[]>([]);
  protected readonly sharing = signal(false);
  protected readonly reminding = signal(false);

  protected readonly canPlan = computed(() => {
    const party = this.party.value();
    return !!party && party.role !== 'viewer' && !party.locked;
  });
  protected readonly sections = computed(() => partySections(this.partyId()));
  protected readonly breadcrumb = computed(() => [
    { label: 'My parties', link: '/parties' },
    { label: this.party.value()?.name ?? 'Party', link: `/parties/${this.partyId()}` },
    { label: 'Guests' },
  ]);
  protected readonly subtitle = computed(() => {
    const counts = this.list.value()?.counts;
    if (!counts) return '';
    const parts = [
      `${counts.invited} invited`,
      `${counts.coming} coming`,
      `${counts.waiting} waiting`,
    ];
    parts.push(`${counts.cantCome} can’t come`);
    if (counts.notSent) parts.push(`${counts.notSent} not sent yet`);
    return parts.join(' · ');
  });
  protected readonly tally = computed(() => {
    const counts = this.list.value()?.counts;
    return counts
      ? [
          { value: counts.coming, label: 'Coming', pop: 'mint' as const },
          { value: counts.waiting, label: 'Waiting', pop: 'sun' as const },
          { value: counts.cantCome, label: 'Can’t come', pop: 'grape' as const },
        ]
      : [];
  });
  protected readonly allergyText = computed(() =>
    (this.list.value()?.allergyList ?? []).map((a) => `${a.child} · ${a.allergy}`).join(' · '),
  );
  /** In the order they were picked. */
  protected readonly selectedNames = computed(() => {
    const guests = this.list.value()?.guests ?? [];
    return joinNames(
      this.selected()
        .map((id) => guests.find((g) => g.id === id))
        .filter((g): g is Guest => !!g)
        .map(firstName),
    );
  });

  constructor() {
    effect(() => {
      this.partyId();
      untracked(() => {
        this.party.reload();
        this.list.reload();
        this.selected.set([]);
      });
    });
  }

  protected badge(guest: Guest) {
    return rsvpBadges[guest.rsvp];
  }

  protected isSelected(guest: Guest): boolean {
    return this.selected().includes(guest.id);
  }

  protected toggle(guest: Guest, checked: boolean): void {
    this.selected.update((ids) =>
      checked ? [...ids, guest.id] : ids.filter((id) => id !== guest.id),
    );
  }

  protected clearSelection(): void {
    this.selected.set([]);
  }

  protected async shareAllergyList(): Promise<void> {
    this.sharing.set(true);
    try {
      const shared = await firstValueFrom(this.guestsApi.shareAllergyList(this.partyId()));
      this.show({
        heading: `Allergy list sent to ${shared.venue}`,
        text: 'First names and allergies only, no contact details.',
        tone: 'success',
      });
    } catch {
      this.show({
        heading: 'The allergy list didn’t send',
        text: 'Book a venue first, or try again in a moment.',
        tone: 'danger',
        persistent: true,
      });
    } finally {
      this.sharing.set(false);
    }
  }

  protected async sendReminders(): Promise<void> {
    const ids = this.selected();
    const sending = this.show({
      heading: `Sending ${ids.length} ${ids.length === 1 ? 'reminder' : 'reminders'} now`,
      text: 'By email and text, wherever we can reach each family.',
      tone: 'info',
      persistent: true,
    });
    this.reminding.set(true);
    try {
      const result = await firstValueFrom(this.guestsApi.remind(this.partyId(), ids));
      this.dismiss(sending);
      this.selected.set([]);
      if (result.reminded.length || result.skipped.length) {
        const parts = [];
        if (result.reminded.length)
          parts.push(
            `${joinNames(result.reminded)}’s ${result.reminded.length === 1 ? 'family' : 'families'} will get a reminder.`,
          );
        for (const skip of result.skipped)
          parts.push(`Skipped ${skip.child}: ${skip.reason.toLowerCase()}.`);
        this.show({
          heading: 'Reminders sent',
          text: parts.join(' '),
          tone: 'success',
          action: { label: 'View guests', link: `/parties/${this.partyId()}/guests` },
        });
      }
      for (const failed of result.undeliverable) {
        this.show({
          heading: `We couldn’t remind ${failed.child}’s family`,
          text: `${failed.reason}.`,
          tone: 'danger',
          persistent: true,
          action: {
            label: 'Fix details',
            link: `/parties/${this.partyId()}/guests`,
            fragment: `guest-${failed.guestId}`,
          },
        });
      }
      this.list.reload();
    } catch {
      this.dismiss(sending);
      this.show({
        heading: 'Reminders didn’t send',
        text: 'Nothing went out. Try again in a moment.',
        tone: 'danger',
        persistent: true,
      });
    } finally {
      this.reminding.set(false);
    }
  }

  protected dismiss(id: number): void {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  private show(
    toast: Omit<PageToast, 'id' | 'action' | 'persistent'> & Partial<PageToast>,
  ): number {
    const id = this.nextToast++;
    this.toasts.update((toasts) => [...toasts, { action: null, persistent: false, ...toast, id }]);
    if (!toast.persistent) setTimeout(() => this.dismiss(id), 6000);
    return id;
  }
}

function firstName(guest: Guest): string {
  return guest.childName.split(' ')[0];
}
