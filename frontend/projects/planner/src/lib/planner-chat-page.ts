import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChatMessage, PlanApplied, Proposal } from '@giddy/api';
import {
  AlertComponent,
  ButtonComponent,
  CardComponent,
  ChatLogComponent,
  ChatMessageComponent,
  ComposerComponent,
  DescriptionItem,
  DescriptionListComponent,
  EmptyStateComponent,
  GiddyDialog,
  IconComponent,
  PlanCardComponent,
  SkeletonComponent,
  SuggestionChipsComponent,
  ToolStepsComponent,
  TypingIndicatorComponent,
} from '@giddy/components';
import { SessionStore, formatClockTime, formatDate, formatMoney, ordinal } from '@giddy/core';
import { AcceptPlanData } from './accept-plan-dialog/accept-plan-data';
import { AcceptPlanDialog } from './accept-plan-dialog/accept-plan-dialog';
import { ChatEntry } from './chat-entry';
import { planRows, planTotal } from './plan-rows';
import { PlannerConversation } from './planner-conversation';

@Component({
  imports: [
    RouterLink,
    AlertComponent,
    ButtonComponent,
    CardComponent,
    ChatLogComponent,
    ChatMessageComponent,
    ComposerComponent,
    DescriptionListComponent,
    EmptyStateComponent,
    IconComponent,
    PlanCardComponent,
    SkeletonComponent,
    SuggestionChipsComponent,
    ToolStepsComponent,
    TypingIndicatorComponent,
  ],
  providers: [PlannerConversation],
  templateUrl: './planner-chat-page.html',
  styleUrl: './planner-chat-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerChatPage {
  protected readonly chat = inject(PlannerConversation);
  private readonly dialogs = inject(GiddyDialog);
  private readonly session = inject(SessionStore).session;
  private readonly composer = viewChild(ComposerComponent);

  protected readonly draft = signal('');
  protected readonly planRows = planRows;
  protected readonly planTotal = planTotal;
  protected readonly parentName = computed(() => this.session()?.name ?? '');
  protected readonly firstName = computed(() => this.parentName().split(' ')[0]);
  protected readonly party = computed(() => this.chat.conversation()?.party ?? null);

  protected readonly subtitle = computed(() => {
    const party = this.party();
    if (!this.chat.entries().length) return 'New conversation';
    return party ? `Planning ${party.name} · ${formatDate(party.date, true)}` : 'Planning a party';
  });

  protected readonly starters = computed(() => {
    const party = this.party();
    const first =
      party?.childName && party.turningAge
        ? `Plan ${party.childName}’s ${ordinal(party.turningAge)} on ${formatDate(party.date)}`
        : 'Plan a birthday party';
    return [
      first,
      'Ideas for a 4-year-old who loves trains',
      'Party for 20 kids under $500',
      'Indoor venues in Scarborough',
    ];
  });

  protected readonly glance = computed<DescriptionItem[]>(() => {
    const party = this.party();
    if (!party) return [];
    return [
      { term: 'Who', detail: party.who ?? party.name },
      { term: 'When', detail: `${formatDate(party.date, true)}, ${party.timeOfDay}` },
      {
        term: 'Where',
        detail: party.area ? `${party.area}, within ${party.radiusKm} km` : 'Not set yet',
      },
      { term: 'Guests', detail: party.guests ? `About ${party.guests} kids` : 'Not set yet' },
      { term: 'Budget', detail: party.budget !== null ? formatMoney(party.budget) : 'Not set yet' },
    ];
  });

  constructor() {
    effect(() => {
      const conversation = this.chat.loader.value();
      if (conversation) this.chat.resume(conversation);
    });
  }

  protected time(message: ChatMessage): string {
    return formatClockTime(new Date(message.sentAt));
  }

  protected isLastGiddyMessage(entry: ChatEntry): boolean {
    const entries = this.chat.entries();
    return entries[entries.length - 1] === entry && entry.message.author === 'giddy';
  }

  protected send(text: string): void {
    void this.chat.send(text);
  }

  protected editMessage(entry: ChatEntry): void {
    this.draft.set(this.chat.takeBack(entry));
    this.composer()?.focus();
  }

  protected sendAgain(entry: ChatEntry): void {
    void this.chat.send(this.chat.takeBack(entry));
  }

  protected swapSomething(): void {
    this.draft.set('Swap ');
    this.composer()?.focus();
  }

  protected useThisPlan(proposal: Proposal): void {
    const party = this.party();
    if (!party) return;
    this.dialogs
      .open<PlanApplied, AcceptPlanData, AcceptPlanDialog>(AcceptPlanDialog, { party, proposal })
      .closed.subscribe((applied) => {
        if (applied) void this.chat.refresh();
      });
  }
}
