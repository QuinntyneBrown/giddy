import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  untracked,
} from '@angular/core';
import { ToastComponent } from './toast';

/** At most three toasts at once: the oldest that would go by itself makes room. */
const maxVisible = 3;

/**
 * Where toasts appear: bottom-right from 640px and full-width above the phone bottom bar below
 * that. The live region is always there, so each new toast is announced.
 */
@Component({
  selector: 'giddy-toast-region',
  templateUrl: './toast-region.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'toast-region', role: 'status', 'aria-live': 'polite' },
})
export class ToastRegionComponent {
  private readonly toasts = contentChildren(ToastComponent, { descendants: true });

  constructor() {
    effect(() => {
      const toasts = this.toasts();
      untracked(() => {
        let extra = toasts.length - maxVisible;
        for (const toast of toasts) {
          if (extra <= 0) break;
          if (toast.expires) {
            toast.expire();
            extra--;
          }
        }
      });
    });
  }
}
