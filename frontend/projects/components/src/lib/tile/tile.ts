import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeComponent } from '../badge/badge';
import { BadgeTone } from '../badge/badge-tone';
import { PopColour } from '../pop/pop-colour';

let nextId = 0;

/**
 * A card in a results grid: art with a status badge, a title (linked when there is a page to go to), and body content (projected
 * by default) with a footer slot (giddyTileFooter) for price and actions.
 */
@Component({
  selector: 'li[giddy-tile]',
  imports: [NgTemplateOutlet, RouterLink, BadgeComponent],
  templateUrl: './tile.html',
  styleUrl: './tile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'card card--flush tile',
    '[class]': "'pop--' + pop()",
    '[class.tile--selected]': 'selected()',
  },
})
export class TileComponent {
  readonly heading = input.required<string>();
  /** Where the title goes; without one the title is plain text. */
  readonly link = input<string | unknown[] | null>(null);
  readonly queryParams = input<Record<string, string> | null>(null);
  readonly emoji = input.required<string>();
  readonly pop = input<PopColour>('grape');
  readonly badge = input<string | null>(null);
  readonly badgeTone = input<BadgeTone>('success');
  /** The one picked from the grid, such as the party's chosen theme. */
  readonly selected = input(false, { transform: booleanAttribute });
  protected readonly headingId = `giddy-tile-${nextId++}`;
}
