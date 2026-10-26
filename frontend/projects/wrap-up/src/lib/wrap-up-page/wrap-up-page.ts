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
import { PARTIES_API, RatedProvider, ThankYouNote, WRAP_UP_API } from '@giddy/api';
import {
  AlertComponent,
  BadgeComponent,
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  DescriptionItem,
  DescriptionListComponent,
  EmptyStateComponent,
  GiddyDialog,
  IconComponent,
  PersonItemComponent,
  PopColour,
  SkeletonComponent,
  StarRatingComponent,
  TabNavComponent,
  ToastComponent,
  ToastRegionComponent,
} from '@giddy/components';
import { ResourceLoader, formatDate, formatMoney, formatMonth, partySections } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { NoteDialog } from '../note-dialog/note-dialog';
import { NoteDialogData } from '../note-dialog/note-dialog-data';
import { ReviewDialog } from '../review-dialog/review-dialog';
import { ReviewDialogData } from '../review-dialog/review-dialog-data';

const pops: PopColour[] = ['sky', 'orange', 'mint', 'pink', 'grape', 'sun'];

/**
 * After the party: Giddy's thank-you notes to edit and send, stars for the businesses the party
 * booked, the final numbers, and saving the plan to start next year's party from.
 */
@Component({
  imports: [
    RouterLink,
    AlertComponent,
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    DescriptionListComponent,
    EmptyStateComponent,
    IconComponent,
    PersonItemComponent,
    SkeletonComponent,
    StarRatingComponent,
    TabNavComponent,
    ToastComponent,
    ToastRegionComponent,
  ],
  templateUrl: './wrap-up-page.html',
  styleUrl: './wrap-up-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WrapUpPage {
  private readonly api = inject(WRAP_UP_API);
  private readonly partiesApi = inject(PARTIES_API);
  private readonly dialog = inject(GiddyDialog);

  /** From the route. */
  readonly partyId = input.required<string>();

  protected readonly party = new ResourceLoader(
    () => this.partiesApi.overview(this.partyId()),
    () => false,
    false,
  );
  protected readonly wrapUp = new ResourceLoader(
    () => this.api.get(this.partyId()),
    () => false,
    false,
  );
  protected readonly sending = signal(false);
  protected readonly savingTemplate = signal(false);
  protected readonly sent = signal<number | null>(null);
  protected readonly problem = signal<string | null>(null);
  protected readonly toast = signal<{ heading: string; text: string } | null>(null);

  protected readonly sections = computed(() => partySections(this.partyId()));
  protected readonly breadcrumb = computed(() => [
    { label: 'My parties', link: '/parties' },
    { label: this.party.value()?.name ?? 'Party', link: `/parties/${this.partyId()}` },
    { label: 'Wrap-up' },
  ]);
  protected readonly canWrapUp = computed(() => {
    const party = this.party.value();
    return !!party && party.role !== 'viewer';
  });
  protected readonly subtitle = computed(() => {
    const party = this.party.value();
    const wrapUp = this.wrapUp.value();
    if (!party || !wrapUp) return '';
    if (!wrapUp.open) return `Opens after the party on ${formatDate(party.date)}`;
    const spent =
      wrapUp.numbers.budget !== null
        ? `${formatMoney(wrapUp.numbers.spent)} spent of ${formatMoney(wrapUp.numbers.budget)}`
        : `${formatMoney(wrapUp.numbers.spent)} spent`;
    return `${formatDate(party.date)} · ${wrapUp.numbers.kidsCame} kids came · ${spent}`;
  });
  protected readonly opensText = computed(() => {
    const wrapUp = this.wrapUp.value();
    return wrapUp
      ? `On ${formatDate(wrapUp.opensOn)} you’ll find thank-you notes drafted by Giddy for every guest, vendor reviews, and a one-tap way to reuse this plan next year.`
      : '';
  });
  protected readonly toSend = computed(
    () => this.wrapUp.value()?.notes.filter((n) => n.status === 'draft' && n.canSend).length ?? 0,
  );
  protected readonly sentCount = computed(
    () => this.wrapUp.value()?.notes.filter((n) => n.status === 'sent').length ?? 0,
  );
  protected readonly numbers = computed<DescriptionItem[]>(() => {
    const numbers = this.wrapUp.value()?.numbers;
    if (!numbers) return [];
    let spent = formatMoney(numbers.spent);
    if (numbers.budget !== null) {
      const difference = numbers.budget - numbers.spent;
      spent +=
        difference >= 0
          ? ` · ${formatMoney(difference)} under`
          : ` · ${formatMoney(-difference)} over`;
    }
    return [
      { term: 'Kids', detail: `${numbers.kidsCame} of ${numbers.invited} came` },
      { term: 'Spent', detail: spent },
      { term: 'Gifts logged', detail: String(numbers.gifts) },
    ];
  });
  protected readonly reminder = computed(() => {
    const remindOn = this.wrapUp.value()?.template?.remindOn;
    return remindOn
      ? `Giddy will remind you in ${formatMonth(remindOn)}, about eight weeks before the next birthday.`
      : 'Start a new party from it whenever you like.';
  });

  constructor() {
    effect(() => {
      this.partyId();
      untracked(() => {
        this.party.reload();
        this.wrapUp.reload();
      });
    });
  }

  protected pop(index: number): PopColour {
    return pops[index % pops.length];
  }

  protected heading(note: ThankYouNote): string {
    return `To ${note.childName} & ${note.parentName.split(' ')[0]}`;
  }

  protected editNote(note: ThankYouNote): void {
    this.dialog
      .open<boolean, NoteDialogData, NoteDialog>(
        NoteDialog,
        { partyId: this.partyId(), note },
        { autoFocus: '[data-initial-focus]' },
      )
      .closed.subscribe((saved) => {
        if (saved) this.wrapUp.reload();
      });
  }

  protected async sendNotes(): Promise<void> {
    this.sending.set(true);
    this.problem.set(null);
    try {
      const { sent } = await firstValueFrom(this.api.sendNotes(this.partyId()));
      this.sent.set(sent);
      this.wrapUp.reload();
    } catch {
      this.problem.set('The notes didn’t send. Nothing was sent twice; try again in a moment.');
    } finally {
      this.sending.set(false);
    }
  }

  protected async rate(provider: RatedProvider, stars: number): Promise<void> {
    this.problem.set(null);
    try {
      await firstValueFrom(
        this.api.rate(this.partyId(), provider.providerId, { stars, review: provider.review }),
      );
      this.toast.set({
        heading: `Thanks for rating ${provider.name}`,
        text: 'Your stars count in its rating for other parents.',
      });
      this.wrapUp.reload();
    } catch {
      this.problem.set(`Your rating of ${provider.name} wasn’t saved. Try again in a moment.`);
    }
  }

  protected review(provider: RatedProvider): void {
    this.dialog
      .open<RatedProvider, ReviewDialogData, ReviewDialog>(
        ReviewDialog,
        { partyId: this.partyId(), provider },
        { autoFocus: '[data-initial-focus]' },
      )
      .closed.subscribe((rated) => {
        if (!rated) return;
        this.toast.set({
          heading: `Thanks for rating ${rated.name}`,
          text: 'Your review helps other GTA parents choose.',
        });
        this.wrapUp.reload();
      });
  }

  protected async saveTemplate(): Promise<void> {
    this.savingTemplate.set(true);
    this.problem.set(null);
    try {
      await firstValueFrom(this.api.saveTemplate(this.partyId()));
      this.wrapUp.reload();
    } catch {
      this.problem.set('The plan wasn’t saved. Try again in a moment.');
    } finally {
      this.savingTemplate.set(false);
    }
  }
}
