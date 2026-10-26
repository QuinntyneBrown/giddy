import { Injectable, signal } from '@angular/core';
import { PushPromptState } from './push-prompt-state';

const invitedKey = 'giddy.push.invitations-sent';
const snoozeKey = 'giddy.push.not-now-until';
const snoozeDays = 30;

/**
 * Asks for push notifications only after the first invitations are sent, and explains why
 * before the browser's own prompt. "Not now" keeps it away from this device for 30 days.
 */
@Injectable({ providedIn: 'root' })
export class PushPrompt {
  private readonly current = signal<PushPromptState>('hidden');
  readonly state = this.current.asReadonly();

  constructor() {
    if (read(invitedKey) && this.undecided() && !this.snoozed()) this.current.set('asking');
  }

  /** The parent has sent invitations: from now on, ask until they decide. */
  invitationsSent(): void {
    write(invitedKey, '1');
    if (this.undecided() && !this.snoozed()) this.current.set('asking');
  }

  async turnOn(): Promise<void> {
    const answer = await Notification.requestPermission();
    this.current.set(answer === 'granted' ? 'on' : answer === 'denied' ? 'blocked' : 'hidden');
  }

  notNow(): void {
    write(snoozeKey, String(Date.now() + snoozeDays * 24 * 60 * 60 * 1000));
    this.current.set('hidden');
  }

  dismiss(): void {
    this.current.set('hidden');
  }

  private undecided(): boolean {
    return typeof Notification !== 'undefined' && Notification.permission === 'default';
  }

  private snoozed(): boolean {
    return Date.now() < Number(read(snoozeKey) ?? 0);
  }
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked; the prompt then only remembers until the page reloads.
  }
}
