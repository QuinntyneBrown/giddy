import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent, ErrorPageComponent, IconComponent } from '@giddy/components';

@Component({
  imports: [RouterLink, ButtonComponent, ErrorPageComponent, IconComponent],
  templateUrl: './server-error-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServerErrorPage {
  private readonly router = inject(Router);
  /** Reference code from the failed response, bound from the `ref` query parameter. */
  readonly ref = input<string>();
  /** The page that failed, bound from the `from` query parameter. */
  readonly from = input<string>();

  protected readonly code = computed(() => {
    const ref = this.ref();
    return ref && /^GDY-[0-9A-Z]{4}$/.test(ref) ? `Error 500 · Reference ${ref}` : 'Error 500';
  });

  protected tryAgain(): void {
    const from = this.from();
    void this.router.navigateByUrl(from?.startsWith('/') && !from.startsWith('//') ? from : '/');
  }
}
