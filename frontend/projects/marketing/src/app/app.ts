import { ChangeDetectionStrategy, Component, DOCUMENT, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SkipLinkComponent } from '@giddy/components';
import { filter } from 'rxjs';

/**
 * Marketing site shell: the skip link and the router outlet; the page owns its header, `main#main`
 * and footer, so they are landmarks side by side. The active route's
 * `page` data is stamped on `<body data-page>`, the contract the app's shell keeps too; the site
 * must not import the app or `@giddy/core`, so the few lines live here.
 */
@Component({
  selector: 'mk-root',
  imports: [RouterOutlet, SkipLinkComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.stampPage());
  }

  private stampPage(): void {
    let route = this.route;
    while (route.firstChild) route = route.firstChild;
    const page = route.snapshot.data['page'];
    if (typeof page === 'string') this.document.body.dataset['page'] = page;
    else delete this.document.body.dataset['page'];
  }
}
