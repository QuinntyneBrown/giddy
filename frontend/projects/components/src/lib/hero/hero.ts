import { ChangeDetectionStrategy, Component } from '@angular/core';

/** The confetti gradient band at the top of a page. Label it with aria-labelledby. */
@Component({
  selector: 'section[giddy-hero]',
  templateUrl: './hero.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'hero confetti' },
})
export class HeroComponent {}
