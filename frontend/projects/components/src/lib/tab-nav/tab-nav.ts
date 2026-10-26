import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TabLink } from './tab-link';

/** Navigation between sibling pages, shown as tabs; the current page is marked. */
@Component({
  selector: 'nav[giddy-tab-nav]',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './tab-nav.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tabs tabs--nav' },
})
export class TabNavComponent {
  readonly tabs = input.required<TabLink[]>();
}
