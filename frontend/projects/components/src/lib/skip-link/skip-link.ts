import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The first focusable element on every page; jumps to the main landmark. Text: "Skip to content". */
@Component({
  selector: 'a[giddy-skip-link]',
  templateUrl: './skip-link.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'skip-link', '[attr.href]': "'#' + mainId()" },
})
export class SkipLinkComponent {
  readonly mainId = input('main');
}
