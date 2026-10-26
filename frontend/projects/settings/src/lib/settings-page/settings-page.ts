import { NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { SignOutDialog } from '@giddy/account';
import {
  ApiProblem,
  Channels,
  MEMORIES_API,
  Memory,
  NotificationChoices,
  PRIVACY_API,
  SETTINGS_API,
  Settings,
} from '@giddy/api';
import {
  AlertComponent,
  AvatarComponent,
  ButtonComponent,
  CardComponent,
  ChoiceComponent,
  EmptyStateComponent,
  ErrorMessage,
  ErrorSummaryComponent,
  FormFieldComponent,
  GiddyDialog,
  IconComponent,
  InputDirective,
  RemovableChipComponent,
  SkeletonComponent,
  SwitchComponent,
  TableWrapComponent,
} from '@giddy/components';
import { ResourceLoader, SessionStore, isCanadianMobile } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { ChangeEmailDialog } from '../change-email-dialog/change-email-dialog';
import { DeleteAccountDialog } from '../delete-account-dialog/delete-account-dialog';
import { ChannelRow } from './channel-row';
import { channelRows } from './channel-rows';

type Field = 'firstName' | 'lastName' | 'mobile' | 'postalCode';
const fieldOrder: Field[] = ['firstName', 'lastName', 'mobile', 'postalCode'];
const postalCode = /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/;

/**
 * Settings: the profile and notification channels saved together, quiet hours that change
 * straight away, what Giddy remembers, and the parent's data and account.
 */
@Component({
  imports: [
    NgTemplateOutlet,
    AlertComponent,
    AvatarComponent,
    ButtonComponent,
    CardComponent,
    ChoiceComponent,
    EmptyStateComponent,
    ErrorSummaryComponent,
    FormFieldComponent,
    IconComponent,
    InputDirective,
    RemovableChipComponent,
    SkeletonComponent,
    SwitchComponent,
    TableWrapComponent,
  ],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly memoriesApi = inject(MEMORIES_API);
  private readonly settingsApi = inject(SETTINGS_API);
  private readonly privacyApi = inject(PRIVACY_API);
  private readonly dialog = inject(GiddyDialog);
  private readonly injector = inject(Injector);
  private readonly summary = viewChild(ErrorSummaryComponent);
  protected readonly session = inject(SessionStore).session;
  protected readonly channelRows = channelRows;
  protected readonly channelNames: (keyof Channels)[] = ['email', 'text', 'push'];
  protected readonly memories = new ResourceLoader(
    () => this.memoriesApi.list(),
    (memories) => memories.length === 0,
  );
  protected readonly settings = new ResourceLoader(() => this.settingsApi.get());

  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly mobile = signal('');
  protected readonly postalCode = signal('');
  protected readonly channels = signal<NotificationChoices | null>(null);
  protected readonly quietHours = signal(true);
  protected readonly pendingEmail = signal<string | null>(null);
  protected readonly errors = signal<Partial<Record<Field, string>>>({});
  protected readonly summaryErrors = computed<ErrorMessage[]>(() =>
    fieldOrder
      .filter((f) => this.errors()[f])
      .map((f) => ({ targetId: `settings-${f}`, message: this.errors()[f]! })),
  );
  protected readonly saving = signal(false);
  protected readonly status = signal<{ heading: string; text: string } | null>(null);
  protected readonly problem = signal<string | null>(null);
  protected readonly subtitle = computed(() => {
    const session = this.session();
    return session ? `${session.name} · ${session.email}` : '';
  });

  constructor() {
    effect(() => {
      const settings = this.settings.value();
      if (settings) untracked(() => this.fill(settings));
    });
  }

  protected checked(row: ChannelRow, channel: keyof Channels): boolean {
    return this.channels()?.[row.key][channel] ?? false;
  }

  protected setChannel(row: ChannelRow, channel: keyof Channels, on: boolean): void {
    this.channels.update((choices) =>
      choices ? { ...choices, [row.key]: { ...choices[row.key], [channel]: on } } : choices,
    );
  }

  protected cancel(): void {
    const settings = this.settings.value();
    if (settings) this.fill(settings);
    this.errors.set({});
    this.status.set(null);
  }

  protected async save(): Promise<void> {
    this.status.set(null);
    this.problem.set(null);
    if (!this.validate()) {
      afterNextRender(() => this.summary()?.focus(), { injector: this.injector });
      return;
    }

    this.saving.set(true);
    try {
      await firstValueFrom(
        this.settingsApi.saveProfile({
          firstName: this.firstName().trim(),
          lastName: this.lastName().trim() || null,
          mobile: this.mobile().trim() || null,
          postalCode: this.postalCode().trim() || null,
        }),
      );
      const saved = await firstValueFrom(this.settingsApi.saveNotifications(this.channels()!));
      this.fill(saved);
      this.status.set({
        heading: 'Your settings are saved',
        text: 'Giddy will use them from now on.',
      });
    } catch (error) {
      const problem =
        error instanceof HttpErrorResponse ? (error.error as ApiProblem | null) : null;
      if (error instanceof HttpErrorResponse && error.status === 400 && problem?.errors) {
        this.errors.set(
          Object.fromEntries(
            fieldOrder.map((f) => [f, problem.errors![f]?.[0]]).filter(([, m]) => m),
          ),
        );
        afterNextRender(() => this.summary()?.focus(), { injector: this.injector });
      } else {
        this.problem.set('Nothing was saved. Try again in a moment.');
      }
    } finally {
      this.saving.set(false);
    }
  }

  /** Quiet hours take effect straight away; a failure puts the switch back. */
  protected async setQuietHours(on: boolean): Promise<void> {
    this.quietHours.set(on);
    this.problem.set(null);
    try {
      await firstValueFrom(this.settingsApi.setQuietHours(on));
    } catch {
      this.quietHours.set(!on);
      this.problem.set('Quiet hours didn’t change. Try again in a moment.');
    }
  }

  protected changeEmail(): void {
    this.dialog
      .open<string, null, ChangeEmailDialog>(ChangeEmailDialog, null, {
        autoFocus: '[data-initial-focus]',
      })
      .closed.subscribe((email) => {
        if (email) this.pendingEmail.set(email);
      });
  }

  protected async download(): Promise<void> {
    this.status.set(null);
    this.problem.set(null);
    try {
      await firstValueFrom(this.privacyApi.requestExport());
      this.status.set({
        heading: 'We’re getting your data ready',
        text: `We’ll email you a link within 24 hours. It works for 7 days, once you sign in.`,
      });
    } catch {
      this.problem.set('We couldn’t start the download. Try again in a moment.');
    }
  }

  protected deleteAccount(): void {
    this.dialog.open<boolean, null, DeleteAccountDialog>(DeleteAccountDialog, null, {
      autoFocus: '[data-initial-focus]',
    });
  }

  protected async forget(memory: Memory): Promise<void> {
    await firstValueFrom(this.memoriesApi.forget(memory.id));
    this.memories.reload();
  }

  protected signOut(): void {
    this.dialog.open<boolean, null, SignOutDialog>(SignOutDialog, null, {
      autoFocus: '[data-initial-focus]',
    });
  }

  private fill(settings: Settings): void {
    this.firstName.set(settings.firstName);
    this.lastName.set(settings.lastName ?? '');
    this.mobile.set(settings.mobile ?? '');
    this.postalCode.set(settings.postalCode ?? '');
    this.channels.set(settings.notifications);
    this.quietHours.set(settings.quietHours);
    this.pendingEmail.set(settings.pendingEmail);
  }

  private validate(): boolean {
    const errors: Partial<Record<Field, string>> = {};
    if (!this.firstName().trim()) errors.firstName = 'Enter your first name';
    const mobile = this.mobile().trim();
    if (mobile && !isCanadianMobile(mobile))
      errors.mobile = 'Enter a Canadian mobile number, like 416-555-0131, or leave it blank';
    const postal = this.postalCode().trim();
    if (postal && !postalCode.test(postal))
      errors.postalCode = 'Enter a Canadian postal code, like M4M 1H1';
    this.errors.set(errors);
    return Object.keys(errors).length === 0;
  }
}
