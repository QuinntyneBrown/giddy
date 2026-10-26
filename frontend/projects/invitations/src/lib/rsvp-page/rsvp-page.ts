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
  viewChild,
} from '@angular/core';
import { ApiProblem, RSVP_API, Rsvp, RsvpReply } from '@giddy/api';
import {
  AlertComponent,
  ButtonComponent,
  ChoiceCardComponent,
  ChoiceComponent,
  ChoiceGroupComponent,
  EmptyStateComponent,
  ErrorMessage,
  ErrorSummaryComponent,
  FormFieldComponent,
  IconComponent,
  InputDirective,
  InviteComponent,
  MascotComponent,
  SkeletonComponent,
} from '@giddy/components';
import { ResourceLoader, formatDate, formatTimeRange } from '@giddy/core';
import { firstValueFrom } from 'rxjs';

type Field = 'parentName' | 'mobile';
const fieldOrder: Field[] = ['parentName', 'mobile'];

/**
 * The page behind a family's private link. No account is needed, and it shows only the
 * invitation and this family's own reply.
 */
@Component({
  imports: [
    AlertComponent,
    ButtonComponent,
    ChoiceCardComponent,
    ChoiceComponent,
    ChoiceGroupComponent,
    EmptyStateComponent,
    ErrorSummaryComponent,
    FormFieldComponent,
    IconComponent,
    InputDirective,
    InviteComponent,
    MascotComponent,
    SkeletonComponent,
  ],
  templateUrl: './rsvp-page.html',
  styleUrl: './rsvp-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RsvpPage {
  private readonly api = inject(RSVP_API);
  private readonly summary = viewChild(ErrorSummaryComponent);

  /** From the route. */
  readonly token = input.required<string>();

  protected readonly rsvp = new ResourceLoader(
    () => this.api.get(this.token()),
    () => false,
    false,
  );
  protected readonly reply = signal<RsvpReply | null>(null);
  protected readonly confirmed = signal<Rsvp | null>(null);
  protected readonly errors = signal<Partial<Record<Field, string>>>({});
  protected readonly sending = signal(false);
  protected readonly problem = signal<string | null>(null);

  protected readonly host = computed(
    () => this.rsvp.value()?.invitation.details.hostName.split(' ')[0] ?? 'the host',
  );
  protected readonly when = computed(() => {
    const details = this.rsvp.value()?.invitation.details;
    return details
      ? `${formatDate(details.date)} · ${formatTimeRange(details.startsAt, details.endsAt)}`
      : '';
  });
  protected readonly summaryErrors = computed<ErrorMessage[]>(() =>
    fieldOrder
      .filter((f) => this.errors()[f])
      .map((f) => ({ targetId: `rsvp-${f}`, message: this.errors()[f]! })),
  );
  protected readonly thanks = computed(() => {
    const done = this.confirmed();
    if (!done) return '';
    const parent = done.guest.parentName.split(' ')[0];
    const child = done.guest.childFirstName;
    if (done.guest.rsvp !== 'coming') return `Thanks for letting ${this.host()} know.`;
    return done.guest.allergies
      ? `Thanks, ${parent}. ${this.host()} now knows about ${child}’s allergy: ${done.guest.allergies}.`
      : `Thanks, ${parent}. ${this.host()} can’t wait to see ${child} there.`;
  });
  protected readonly formatDate = formatDate;

  constructor() {
    effect(() => {
      this.token();
      untracked(() => {
        this.confirmed.set(null);
        this.rsvp.reload();
      });
    });
    effect(() => {
      const rsvp = this.rsvp.value();
      if (rsvp) untracked(() => this.reply.set(replyOf(rsvp)));
    });
  }

  protected calendarUrl(): string {
    return this.api.calendarUrl(this.token());
  }

  protected update<K extends keyof RsvpReply>(key: K, value: RsvpReply[K]): void {
    this.reply.update((reply) => (reply ? { ...reply, [key]: value } : reply));
  }

  protected changeReply(): void {
    const done = this.confirmed();
    if (done) this.reply.set(replyOf(done));
    this.confirmed.set(null);
  }

  protected async send(): Promise<void> {
    const reply = this.reply();
    if (!reply || !this.validate(reply)) {
      queueMicrotask(() => this.summary()?.focus());
      return;
    }

    this.sending.set(true);
    this.problem.set(null);
    try {
      this.confirmed.set(
        await firstValueFrom(
          this.api.reply(this.token(), {
            ...reply,
            allergies: reply.coming ? reply.allergies?.trim() || null : null,
            parentName: reply.parentName.trim(),
            mobile: reply.mobile?.trim() || null,
            note: reply.note?.trim() || null,
          }),
        ),
      );
    } catch (error) {
      const problem =
        error instanceof HttpErrorResponse ? (error.error as ApiProblem | null) : null;
      if (error instanceof HttpErrorResponse && error.status === 400 && problem?.errors) {
        this.errors.set({
          parentName: problem.errors['parentName']?.[0],
          mobile: problem.errors['mobile']?.[0],
        });
        queueMicrotask(() => this.summary()?.focus());
      } else {
        this.problem.set(
          error instanceof HttpErrorResponse && error.status === 409
            ? problem!.title
            : 'Your reply didn’t send. Try again in a moment.',
        );
      }
    } finally {
      this.sending.set(false);
    }
  }

  private validate(reply: RsvpReply): boolean {
    const errors: Partial<Record<Field, string>> = {};
    if (!reply.parentName.trim())
      errors.parentName = `Add your name so ${this.host()} knows who replied`;
    const digits = (reply.mobile ?? '').replace(/\D/g, '');
    if (digits && !(digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))))
      errors.mobile = 'Enter a 10-digit mobile number, like 416-555-0177, or leave it blank';
    this.errors.set(errors);
    return Object.keys(errors).length === 0;
  }
}

function replyOf(rsvp: Rsvp): RsvpReply {
  return {
    coming: rsvp.guest.rsvp !== 'cantCome',
    allergies: rsvp.guest.allergies,
    parentStaying: rsvp.guest.parentStaying,
    siblings: rsvp.guest.siblings,
    parentName: rsvp.guest.parentName,
    mobile: rsvp.guest.mobile,
    note: rsvp.guest.note,
  };
}
