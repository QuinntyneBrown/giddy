import { HttpErrorResponse } from '@angular/common/http';
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
  ApiProblem,
  GUESTS_API,
  INVITATIONS_API,
  Invitation,
  InvitationsSent,
  PARTIES_API,
} from '@giddy/api';
import {
  AlertComponent,
  BreadcrumbComponent,
  ButtonComponent,
  ChoiceCardComponent,
  ChoiceComponent,
  ChoiceGroupComponent,
  EmptyStateComponent,
  FormFieldComponent,
  IconComponent,
  InputDirective,
  InviteComponent,
  SkeletonComponent,
  TabNavComponent,
  TallyComponent,
  ToastComponent,
  ToastRegionComponent,
} from '@giddy/components';
import {
  ResourceLoader,
  SessionStore,
  formatDate,
  formatTimeRange,
  partySections,
  torontoToday,
} from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { invitationDesigns } from './invitation-designs';
import { InvitationForm } from './invitation-form';

type Field = 'headline' | 'message' | 'rsvpBy';
const headlineMax = 60;
const messageMax = 280;

/** Giddy's draft invitation: edit it with a live preview, send a test, then send it to every family. */
@Component({
  imports: [
    RouterLink,
    AlertComponent,
    BreadcrumbComponent,
    ButtonComponent,
    ChoiceCardComponent,
    ChoiceComponent,
    ChoiceGroupComponent,
    EmptyStateComponent,
    FormFieldComponent,
    IconComponent,
    InputDirective,
    InviteComponent,
    SkeletonComponent,
    TabNavComponent,
    TallyComponent,
    ToastComponent,
    ToastRegionComponent,
  ],
  templateUrl: './invitation-page.html',
  styleUrl: './invitation-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationPage {
  private readonly invitationsApi = inject(INVITATIONS_API);
  private readonly partiesApi = inject(PARTIES_API);
  private readonly guestsApi = inject(GUESTS_API);
  private readonly session = inject(SessionStore).session;

  /** From the route. */
  readonly partyId = input.required<string>();

  protected readonly party = new ResourceLoader(
    () => this.partiesApi.overview(this.partyId()),
    () => false,
    false,
  );
  protected readonly invitation = new ResourceLoader(
    () => this.invitationsApi.get(this.partyId()),
    () => false,
    false,
  );
  protected readonly guests = new ResourceLoader(
    () => this.guestsApi.list(this.partyId()),
    () => false,
    false,
  );
  protected readonly form = signal<InvitationForm | null>(null);
  protected readonly errors = signal<Partial<Record<Field, string>>>({});
  protected readonly state = signal<'editing' | 'testing' | 'sending'>('editing');
  protected readonly problem = signal<{ heading: string; text: string; verify: boolean } | null>(
    null,
  );
  protected readonly sent = signal<InvitationsSent | null>(null);
  protected readonly toast = signal<string | null>(null);
  protected readonly designs = invitationDesigns;
  protected readonly headlineMax = headlineMax;
  protected readonly messageMax = messageMax;

  protected readonly canPlan = computed(() => {
    const party = this.party.value();
    return !!party && party.role !== 'viewer' && !party.locked;
  });
  protected readonly sections = computed(() => partySections(this.partyId()));
  protected readonly breadcrumb = computed(() => [
    { label: 'My parties', link: '/parties' },
    { label: this.party.value()?.name ?? 'Party', link: `/parties/${this.partyId()}` },
    { label: 'Invitations' },
  ]);
  /** Everyone is invited: show what went out instead of the editor. */
  protected readonly allSent = computed(() => {
    const invitation = this.invitation.value();
    return !!this.sent() || (!!invitation?.sentAt && invitation.notSent === 0);
  });
  protected readonly subtitle = computed(() => {
    const invitation = this.invitation.value();
    if (!invitation) return '';
    if (!invitation.sentAt && !this.sent())
      return `Not sent yet · ${invitation.families} families on the guest list`;
    const counts = this.guests.value()?.counts;
    const sentOn = formatDate(torontoToday(new Date(invitation.sentAt ?? Date.now())));
    const parts = [`Sent ${sentOn}`];
    if (counts) {
      parts.push(`${counts.coming + counts.cantCome} replied`, `${counts.waiting} waiting`);
      if (counts.notSent && !this.sent()) parts.push(`${counts.notSent} not invited yet`);
    }
    return parts.join(' · ');
  });
  protected readonly tally = computed(() => {
    const counts = this.guests.value()?.counts;
    return counts
      ? [
          { value: counts.coming, label: 'Coming', pop: 'mint' as const },
          { value: counts.waiting, label: 'Waiting', pop: 'sun' as const },
          { value: counts.cantCome, label: 'Can’t come', pop: 'grape' as const },
        ]
      : [];
  });
  protected readonly when = computed(() => {
    const details = this.invitation.value()?.details;
    return details
      ? `${formatDate(details.date)} · ${formatTimeRange(details.startsAt, details.endsAt)}`
      : '';
  });
  protected readonly rsvpHelp = computed(() => {
    const rsvpBy = this.form()?.rsvpBy;
    const partyDate = this.invitation.value()?.details.date;
    if (!rsvpBy || !partyDate) return null;
    const days = Math.round((Date.parse(partyDate) - Date.parse(rsvpBy)) / 86_400_000);
    return days > 0
      ? `${formatDate(rsvpBy)}, ${days} ${days === 1 ? 'day' : 'days'} before the party`
      : formatDate(rsvpBy);
  });
  protected readonly noMobile = computed(() => {
    const invitation = this.invitation.value();
    return invitation ? invitation.families - invitation.textReach : 0;
  });
  protected readonly sendLabel = computed(() => {
    const invitation = this.invitation.value();
    if (!invitation) return 'Send';
    const families = invitation.sentAt ? invitation.notSent : invitation.families;
    const noun = families === 1 ? 'family' : 'families';
    return invitation.sentAt ? `Send to ${families} new ${noun}` : `Send to ${families} ${noun}`;
  });
  protected readonly sentHeading = computed(() => {
    const families = this.sent()?.sent ?? this.invitation.value()?.families ?? 0;
    return `Invites sent to ${families} ${families === 1 ? 'family' : 'families'}`;
  });
  protected readonly sentText = computed(() => {
    const invitation = this.invitation.value();
    if (!invitation) return '';
    const channels =
      invitation.byEmail && invitation.byText
        ? 'an email and a text'
        : invitation.byEmail
          ? 'an email'
          : 'a text';
    const reminder = this.sent()?.automaticReminderOn ?? invitation.automaticReminderOn;
    return `Each parent gets ${channels} with a private RSVP link, wherever we have their details. We’ll remind anyone who hasn’t replied on ${formatDate(reminder)}.`;
  });
  protected readonly formatDate = formatDate;

  constructor() {
    effect(() => {
      this.partyId();
      untracked(() => {
        this.party.reload();
        this.invitation.reload();
        this.guests.reload();
        this.sent.set(null);
      });
    });
    effect(() => {
      const invitation = this.invitation.value();
      if (invitation) untracked(() => this.form.set(formOf(invitation)));
    });
  }

  protected update<K extends keyof InvitationForm>(key: K, value: InvitationForm[K]): void {
    this.form.update((form) => (form ? { ...form, [key]: value } : form));
    if (key in this.errors()) this.errors.update((errors) => ({ ...errors, [key]: undefined }));
  }

  protected async sendTest(): Promise<void> {
    if (!this.validate()) return;
    this.state.set('testing');
    this.problem.set(null);
    try {
      await this.save();
      await firstValueFrom(this.invitationsApi.sendTest(this.partyId()));
      this.toast.set(`Test sent to ${this.session()?.email ?? 'your email'}`);
    } catch (error) {
      this.fail(error, 'The test didn’t send');
    } finally {
      this.state.set('editing');
    }
  }

  protected async send(): Promise<void> {
    if (!this.validate()) return;
    this.state.set('sending');
    this.problem.set(null);
    try {
      await this.save();
      this.sent.set(await firstValueFrom(this.invitationsApi.send(this.partyId())));
      this.invitation.reload();
      this.guests.reload();
    } catch (error) {
      this.fail(error, 'The invitations didn’t send');
    } finally {
      this.state.set('editing');
    }
  }

  private async save(): Promise<void> {
    await firstValueFrom(this.invitationsApi.save(this.partyId(), this.form()!));
  }

  private validate(): boolean {
    const form = this.form();
    const partyDate = this.invitation.value()?.details.date;
    if (!form || !partyDate) return false;
    const errors: Partial<Record<Field, string>> = {};
    if (!form.headline.trim()) errors.headline = 'Add a headline.';
    else if (form.headline.length > headlineMax)
      errors.headline = `Keep the headline to ${headlineMax} characters.`;
    if (!form.message.trim()) errors.message = 'Add a message.';
    else if (form.message.length > messageMax)
      errors.message = `Keep the message to ${messageMax} characters.`;
    if (!form.rsvpBy) errors.rsvpBy = 'Choose an RSVP-by date.';
    else if (form.rsvpBy >= partyDate) errors.rsvpBy = 'Choose an RSVP-by date before the party.';
    this.errors.set(errors);
    return Object.keys(errors).length === 0;
  }

  private fail(error: unknown, heading: string): void {
    const problem =
      error instanceof HttpErrorResponse
        ? (error.error as (ApiProblem & { code?: string }) | null)
        : null;
    if (error instanceof HttpErrorResponse && error.status === 400 && problem?.errors) {
      this.errors.set({
        headline: problem.errors['headline']?.[0],
        message: problem.errors['message']?.[0],
        rsvpBy: problem.errors['rsvpBy']?.[0],
      });
      return;
    }
    const verify = problem?.code === 'email-unverified';
    this.problem.set({
      heading: verify ? 'Verify your email first' : heading,
      text: verify ? problem!.title : 'Nothing went out. Try again in a moment.',
      verify,
    });
  }
}

function formOf(invitation: Invitation): InvitationForm {
  return {
    design: invitation.design,
    headline: invitation.headline,
    message: invitation.message,
    rsvpBy: invitation.rsvpBy,
    askAllergies: invitation.askAllergies,
    askParentStaying: invitation.askParentStaying,
    askSiblings: invitation.askSiblings,
    byEmail: invitation.byEmail,
    byText: invitation.byText,
  };
}
