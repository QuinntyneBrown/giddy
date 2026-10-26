import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  ButtonComponent,
  ChoiceComponent,
  ProseComponent,
  ToastComponent,
  ToastRegionComponent,
} from '@giddy/components';
import { CookieChoice, CookieConsent } from '@giddy/core';

/** Terms & privacy in plain words, and the place to change this device's cookie choice. */
@Component({
  imports: [ButtonComponent, ChoiceComponent, ProseComponent, ToastComponent, ToastRegionComponent],
  templateUrl: './legal-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalPage {
  private readonly consent = inject(CookieConsent);
  protected readonly selected = signal<CookieChoice>(this.consent.choice() ?? 'essential');
  protected readonly saved = signal<string | null>(null);

  protected save(): void {
    this.consent.choose(this.selected());
    this.saved.set(this.selected() === 'all' ? 'Allow all.' : 'Essential only.');
  }
}
