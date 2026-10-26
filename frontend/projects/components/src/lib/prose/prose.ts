import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Long-form reading, such as Terms & privacy: a card at a comfortable line length. */
@Component({
  selector: 'article[giddy-prose]',
  templateUrl: './prose.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'prose card' },
})
export class ProseComponent {}
