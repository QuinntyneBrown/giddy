import { Injectable, computed, signal } from '@angular/core';

export const maxCompared = 3;

/** The venues ticked for comparison, kept while the parent moves between venue pages. */
@Injectable({ providedIn: 'root' })
export class CompareSelection {
  private readonly picked = signal<{ id: string; name: string }[]>([]);
  readonly venues = this.picked.asReadonly();
  readonly ids = computed(() => this.picked().map((v) => v.id));
  /** Set when a parent tries to tick a fourth venue. */
  readonly refused = signal(false);

  has(id: string): boolean {
    return this.ids().includes(id);
  }

  /** Ticks or unticks a venue; returns false when a fourth is refused. */
  toggle(id: string, name: string, picked: boolean): boolean {
    this.refused.set(false);
    if (!picked) {
      this.picked.update((venues) => venues.filter((v) => v.id !== id));
      return true;
    }
    if (this.picked().length >= maxCompared) {
      this.refused.set(true);
      return false;
    }
    this.picked.update((venues) => [...venues, { id, name }]);
    return true;
  }
}
