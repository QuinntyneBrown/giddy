import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { GUESTS_API, LiveUpdate } from '@giddy/api';
import { ToastComponent, ToastRegionComponent, ToastTone } from '@giddy/components';
import { LiveUpdates } from '@giddy/core';
import { firstValueFrom } from 'rxjs';

interface ShownToast {
  key: string;
  heading: string;
  text: string;
  tone: ToastTone;
  update: LiveUpdate | null;
  persistent: boolean;
}

/**
 * Toasts for replies, opens, new allergies and bounces while the host has Giddy open. Danger
 * toasts stay until dismissed; the rest fade after a while.
 */
@Component({
  selector: 'giddy-live-rsvp-toasts',
  imports: [RouterLink, ToastComponent, ToastRegionComponent],
  templateUrl: './live-rsvp-toasts.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveRsvpToasts {
  private readonly live = inject(LiveUpdates);
  private readonly guestsApi = inject(GUESTS_API);
  private next = 0;
  protected readonly toasts = signal<ShownToast[]>([]);
  protected readonly sharing = signal<string | null>(null);

  constructor() {
    this.live.start();
    inject(DestroyRef).onDestroy(() => this.live.stop());
    effect(() => {
      const updates = this.live.latest();
      untracked(() => updates.forEach((update) => this.add(update)));
    });
  }

  protected guestsLink(update: LiveUpdate): string {
    return `/parties/${update.partyId}/guests`;
  }

  protected async share(toast: ShownToast): Promise<void> {
    const update = toast.update!;
    this.sharing.set(toast.key);
    try {
      const shared = await firstValueFrom(this.guestsApi.shareAllergyList(update.partyId));
      this.dismiss(toast.key);
      this.show({
        heading: `Allergy list sent to ${shared.venue}`,
        text: 'First names and allergies only, no contact details.',
        tone: 'success',
        update: null,
        persistent: false,
      });
    } catch {
      this.show({
        heading: 'The allergy list didn’t send',
        text: 'Try again from the guest list in a moment.',
        tone: 'danger',
        update: null,
        persistent: true,
      });
    } finally {
      this.sharing.set(null);
    }
  }

  protected dismiss(key: string): void {
    this.toasts.update((toasts) => toasts.filter((t) => t.key !== key));
  }

  private add(update: LiveUpdate): void {
    this.show({
      heading: update.title,
      text: update.text,
      tone: update.tone,
      update,
      persistent: update.tone === 'danger' || update.tone === 'warning',
    });
  }

  private show(toast: Omit<ShownToast, 'key'>): void {
    const key = `live-${this.next++}`;
    this.toasts.update((toasts) => [...toasts.slice(-3), { ...toast, key }]);
    if (!toast.persistent) setTimeout(() => this.dismiss(key), 8000);
  }
}
