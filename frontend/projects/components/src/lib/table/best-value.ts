import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

/** A table value that is marked "Best" in words as well as colour when it is the best in its row. */
@Component({
  selector: 'giddy-best-value',
  imports: [NgTemplateOutlet],
  templateUrl: './best-value.html',
  styleUrl: './best-value.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BestValueComponent {
  readonly best = input(false, { transform: booleanAttribute });
}
