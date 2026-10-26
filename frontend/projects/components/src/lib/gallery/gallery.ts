import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PopColour } from '../pop/pop-colour';

export interface GalleryItem {
  emoji: string;
  pop: PopColour;
}

/** A photo gallery, described in words for screen readers. */
@Component({
  selector: 'giddy-gallery',
  templateUrl: './gallery.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gallery', role: 'img', '[attr.aria-label]': "'Photos: ' + description()" },
})
export class GalleryComponent {
  readonly items = input.required<GalleryItem[]>();
  readonly description = input.required<string>();
}
