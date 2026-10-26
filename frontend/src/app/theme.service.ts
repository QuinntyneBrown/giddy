import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  applySavedOrSystemTheme(): void {
    const saved = localStorage.getItem('giddy-theme');
    const theme: Theme = saved === 'dark' || saved === 'light'
      ? saved
      : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    this.document.documentElement.dataset['theme'] = theme;
  }
}
