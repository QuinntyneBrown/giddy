import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent, ErrorPageComponent, IconComponent } from '@giddy/components';

@Component({
  imports: [ButtonComponent, ErrorPageComponent, IconComponent],
  templateUrl: './offline-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfflinePage {
  private readonly router = inject(Router);
  /** The page that could not load, bound from the `from` query parameter. */
  readonly from = input<string>();
  private readonly target = computed(() => {
    const from = this.from();
    return from?.startsWith('/') && !from.startsWith('//') ? from : '/';
  });

  protected tryAgain(): void {
    void this.router.navigateByUrl(this.target());
  }
}
