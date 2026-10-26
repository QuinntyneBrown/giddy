import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../icon/icon';
import { IconName } from '../icon/icon-name';
import { ToastTone } from './toast-tone';

const toneIcons: Record<ToastTone, IconName> = {
  neutral: 'check-circle',
  info: 'info',
  success: 'check-circle',
  warning: 'alert',
  danger: 'alert',
};

/** How long a toast stays: 8 s for most, 12 s for a warning; a danger toast stays until dismissed. */
const durations: Record<ToastTone, number | null> = {
  neutral: 8000,
  info: 8000,
  success: 8000,
  warning: 12_000,
  danger: null,
};

/**
 * A short message with an optional action (projected). It dismisses itself after 8 seconds (12 for
 * a warning), pausing while the pointer is over it or focus is inside it, so an Undo stays as long
 * as the toast does. A danger toast is announced as an alert and stays until dismissed. Messages
 * that update in place, such as a selection count, are sticky and never time out. A link or button
 * with giddyToastAction sits under the text; anything else is projected beside it.
 */
@Component({
  selector: 'giddy-toast',
  imports: [IconComponent],
  templateUrl: './toast.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'toast',
    '[class.toast--info]': "tone() === 'info'",
    '[class.toast--success]': "tone() === 'success'",
    '[class.toast--warning]': "tone() === 'warning'",
    '[class.toast--danger]': "tone() === 'danger'",
    '[attr.role]': "tone() === 'danger' ? 'alert' : null",
    '(mouseenter)': 'hold("pointer", true)',
    '(mouseleave)': 'hold("pointer", false)',
    '(focusin)': 'hold("focus", true)',
    '(focusout)': 'hold("focus", false)',
  },
})
export class ToastComponent {
  readonly heading = input.required<string>();
  readonly text = input<string | null>(null);
  readonly tone = input<ToastTone>('neutral');
  /** Overrides the tone's icon. */
  readonly icon = input<IconName | null>(null);
  readonly dismissible = input(false, { transform: booleanAttribute });
  /** Stays until its reason goes away, such as a selection count. */
  readonly sticky = input(false, { transform: booleanAttribute });
  readonly dismissed = output<void>();
  protected readonly shownIcon = computed(() => this.icon() ?? toneIcons[this.tone()]);
  protected readonly canDismiss = computed(() => this.dismissible() || this.tone() === 'danger');
  private timer: ReturnType<typeof setTimeout> | undefined;
  private remaining: number | null = null;
  private startedAt = 0;
  private hovered = false;
  private focused = false;

  constructor() {
    afterNextRender(() => {
      this.remaining = this.sticky() ? null : durations[this.tone()];
      this.start();
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  /** Whether it goes by itself, so the region may remove it to make room. */
  get expires(): boolean {
    return !this.sticky() && this.tone() !== 'danger';
  }

  /** Removes it now, for example when newer toasts need the room. */
  expire(): void {
    clearTimeout(this.timer);
    this.remaining = null;
    this.dismissed.emit();
  }

  /** Pauses while the pointer is over it or focus is inside it, and resumes when neither is. */
  protected hold(by: 'pointer' | 'focus', on: boolean): void {
    if (by === 'pointer') this.hovered = on;
    else this.focused = on;
    if (on) this.stop();
    else this.start();
  }

  private start(): void {
    if (this.remaining === null || this.hovered || this.focused) return;
    clearTimeout(this.timer);
    this.startedAt = Date.now();
    this.timer = setTimeout(() => this.expire(), this.remaining);
  }

  private stop(): void {
    if (this.remaining === null || this.timer === undefined) return;
    clearTimeout(this.timer);
    this.timer = undefined;
    this.remaining = Math.max(0, this.remaining - (Date.now() - this.startedAt));
  }
}
