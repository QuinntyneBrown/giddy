import { Injectable, computed, signal } from '@angular/core';
import { CookieChoice } from './cookie-choice';

const key = 'giddy.cookie-choice';
const keptFor = 365 * 24 * 60 * 60 * 1000;

/**
 * The visitor's cookie choice on this device, asked for again after 12 months. Nothing beyond
 * essential cookies may load until analyticsAllowed is true.
 */
@Injectable({ providedIn: 'root' })
export class CookieConsent {
  private readonly current = signal<CookieChoice | null>(load());
  readonly choice = this.current.asReadonly();
  readonly analyticsAllowed = computed(() => this.current() === 'all');

  choose(choice: CookieChoice): void {
    try {
      localStorage.setItem(key, JSON.stringify({ choice, savedAt: Date.now() }));
    } catch {
      // Storage can be blocked; the choice then lasts until the page reloads.
    }
    this.current.set(choice);
  }
}

function load(): CookieChoice | null {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? 'null') as {
      choice: CookieChoice;
      savedAt: number;
    } | null;
    return saved && Date.now() - saved.savedAt < keptFor ? saved.choice : null;
  } catch {
    return null;
  }
}
