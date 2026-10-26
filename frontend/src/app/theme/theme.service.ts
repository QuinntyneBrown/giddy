import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { Theme } from './theme';

const storageKey = 'giddy-theme';

/** Follows the device's colour preference unless the parent has chosen a theme on this device. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly current = signal<Theme>('light');
  readonly theme = this.current.asReadonly();

  applySavedOrSystemTheme(): void {
    this.apply(this.savedTheme() ?? this.systemTheme());
  }

  toggle(): void {
    const theme: Theme = this.current() === 'dark' ? 'light' : 'dark';
    this.save(theme);
    this.apply(theme);
  }

  private apply(theme: Theme): void {
    this.current.set(theme);
    this.document.documentElement.dataset['theme'] = theme;
  }

  private savedTheme(): Theme | null {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved === 'dark' || saved === 'light' ? saved : null;
    } catch {
      return null;
    }
  }

  private save(theme: Theme): void {
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
  }

  private systemTheme(): Theme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
