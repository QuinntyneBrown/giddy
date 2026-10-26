import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** A big number with a short caption beside it. */
@Component({
  selector: 'giddy-stat',
  templateUrl: './stat.html',
  styleUrl: './stat.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'cluster cluster--between' },
})
export class StatComponent {
  readonly value = input.required<string>();
  readonly caption = input('');
}
