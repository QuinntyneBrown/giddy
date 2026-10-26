import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Where toasts appear: above the phone bottom bar, announced politely. */
@Component({
  selector: 'giddy-toast-region',
  templateUrl: './toast-region.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'toast-region', role: 'status', 'aria-live': 'polite' },
})
export class ToastRegionComponent {}
