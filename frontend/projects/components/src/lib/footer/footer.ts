import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterLink } from './footer-link';

/** Site footer with a short line of text and supporting links such as Help. */
@Component({
  selector: 'footer[giddy-footer]',
  imports: [RouterLink],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'footer' },
})
export class FooterComponent {
  readonly text = input.required<string>();
  readonly links = input<FooterLink[]>([]);
}
