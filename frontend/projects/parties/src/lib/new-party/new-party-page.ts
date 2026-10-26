import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  ApiProblem,
  BudgetRange,
  Child,
  FAMILY_API,
  PARTIES_API,
  PlanTemplate,
  WRAP_UP_API,
} from '@giddy/api';
import {
  AlertComponent,
  AvatarComponent,
  BreadcrumbComponent,
  ButtonComponent,
  ChoiceCardComponent,
  ChoiceGroupComponent,
  ErrorMessage,
  ErrorSummaryComponent,
  FormFieldComponent,
  IconComponent,
  InputDirective,
  InputGroupComponent,
  StepperComponent,
} from '@giddy/components';
import { ResourceLoader, formatDate, formatMoney } from '@giddy/core';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { NewPartyField, fieldOrder, validateNewParty } from './new-party-errors';
import { newPartyForm, someoneElse } from './new-party-form';

/** Plan a new party: who, when, how many, time of day, budget and area. */
@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AlertComponent,
    AvatarComponent,
    BreadcrumbComponent,
    ButtonComponent,
    ChoiceCardComponent,
    ChoiceGroupComponent,
    ErrorSummaryComponent,
    FormFieldComponent,
    IconComponent,
    InputDirective,
    InputGroupComponent,
    StepperComponent,
  ],
  templateUrl: './new-party-page.html',
  styleUrl: './new-party-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPartyPage {
  private readonly familyApi = inject(FAMILY_API);
  private readonly partiesApi = inject(PARTIES_API);
  private readonly router = inject(Router);
  private readonly summary = viewChild(ErrorSummaryComponent);

  /** A child to start with, from the `child` query parameter. */
  readonly child = input<string>();
  /** A plan saved from an earlier party, from the `template` query parameter. */
  readonly template = input<string>();
  private readonly wrapUpApi = inject(WRAP_UP_API);
  /** The saved plan this party starts from, once loaded. */
  protected readonly startingFrom = signal<PlanTemplate | null>(null);

  protected readonly form = newPartyForm();
  protected readonly someoneElse = someoneElse;
  protected readonly family = new ResourceLoader(() => this.familyApi.get());
  protected readonly errors = signal<Partial<Record<NewPartyField, string>>>({});
  protected readonly state = signal<'editing' | 'saving' | 'failed'>('editing');
  protected readonly breadcrumb = [
    { label: 'My parties', link: '/parties' },
    { label: 'New party' },
  ];
  protected readonly steps = ['Basics', 'Chat with Giddy', 'Review plan'];

  private readonly value = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    {
      initialValue: this.form.getRawValue(),
    },
  );

  protected readonly children = computed(() => this.family.value()?.children ?? []);
  protected readonly chosenChild = computed(
    () => this.children().find((c) => c.id === this.value().child) ?? null,
  );

  protected readonly summaryErrors = computed<ErrorMessage[]>(() => {
    const errors = this.errors();
    return fieldOrder
      .filter((field) => errors[field])
      .map((field) => ({ targetId: `np-${field}`, message: errors[field]! }));
  });

  protected readonly dateHelp = computed(() => {
    const { date } = this.value();
    if (!date) return null;
    const child = this.chosenChild();
    return child && child.nextBirthday === date
      ? `${formatDate(date, true)} · ${child.firstName}’s actual birthday`
      : formatDate(date, true);
  });

  protected readonly guestsHelp = computed(() => {
    const child = this.chosenChild();
    return child ? `Including ${child.firstName}` : null;
  });

  private readonly budgetRange = toSignal(
    this.form.controls.guests.valueChanges.pipe(
      startWith(this.form.controls.guests.value),
      debounceTime(250),
      map((value) => Number(value)),
      distinctUntilChanged(),
      switchMap((guests) =>
        Number.isInteger(guests) && guests >= 1 && guests <= 60
          ? this.partiesApi.budgetGuide(guests).pipe(catchError(() => of(null)))
          : of(null),
      ),
    ),
    { initialValue: null as BudgetRange | null },
  );

  protected readonly budgetHelp = computed(() => {
    const range = this.budgetRange();
    return range
      ? `Typical for ${range.guests} kids in Toronto: ${formatMoney(range.low)}–${formatMoney(range.high)}`
      : null;
  });

  protected readonly areaHelp = computed(() => {
    const family = this.family.value();
    const postalCode = this.value().postalCode.replace(/\s/g, '').toUpperCase();
    const isHome =
      family?.postalCode && family.postalCode.replace(/\s/g, '').toUpperCase() === postalCode;
    return isHome && family?.areaName
      ? `${family.areaName} · we’ll look within 10 km`
      : 'We’ll look within 10 km';
  });

  constructor() {
    effect(() => {
      const id = this.template();
      this.startingFrom.set(null);
      if (id)
        this.wrapUpApi.template(id).subscribe({
          next: (plan) => this.startingFrom.set(plan),
          error: () => this.startingFrom.set(null),
        });
    });
    effect(() => {
      const family = this.family.value();
      if (!family || this.form.controls.postalCode.dirty) return;
      const wanted = this.startingFrom()?.childId ?? this.child();
      const preferred = family.children.find((c) => c.id === wanted) ?? family.children[0];
      this.form.patchValue({
        postalCode: family.postalCode ?? '',
        child: preferred?.id ?? someoneElse,
      });
      if (preferred) this.form.controls.date.setValue(preferred.nextBirthday);
    });
  }

  protected chooseChild(child: Child | null): void {
    this.form.controls.child.setValue(child?.id ?? someoneElse);
    if (child) this.form.controls.date.setValue(child.nextBirthday);
  }

  protected childCaption(child: Child): string {
    return `Turns ${child.turningAge} · ${formatDate(child.nextBirthday)}`;
  }

  protected async submit(): Promise<void> {
    const errors = validateNewParty(this.form);
    this.errors.set(errors);
    if (Object.keys(errors).length) {
      setTimeout(() => this.summary()?.focus());
      return;
    }

    this.state.set('saving');
    const value = this.form.getRawValue();
    const isChild = value.child !== someoneElse;
    try {
      const party = await firstValueFrom(
        this.partiesApi.create({
          childId: isChild ? value.child : null,
          childName: isChild ? null : value.childName.trim(),
          turningAge: isChild ? null : Number(value.turningAge),
          date: value.date,
          guests: Number(value.guests),
          timeOfDay: value.timeOfDay,
          budget: Number(value.budget),
          postalCode: value.postalCode.trim().toUpperCase(),
          ...(this.startingFrom() ? { templateId: this.startingFrom()!.templateId } : {}),
        }),
      );
      if (this.startingFrom()) {
        // The saved plan is already in place, so the party opens on its overview.
        await this.router.navigateByUrl(`/parties/${party.id}`);
        return;
      }
      await firstValueFrom(this.partiesApi.startConversation(party.id));
      await this.router.navigateByUrl('/ask-giddy');
    } catch (error) {
      const problem =
        error instanceof HttpErrorResponse ? (error.error as ApiProblem | null) : null;
      if (problem?.errors) {
        this.errors.set(
          Object.fromEntries(
            Object.entries(problem.errors).map(([field, messages]) => [field, messages[0]]),
          ),
        );
        this.state.set('editing');
        setTimeout(() => this.summary()?.focus());
      } else {
        this.state.set('failed');
      }
    }
  }
}
