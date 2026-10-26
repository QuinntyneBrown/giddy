import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AvatarComponent } from '../avatar/avatar';
import { PopColour } from '../pop/pop-colour';

/**
 * A list row led by a person's avatar: a heading, trailing status or actions, and a body such
 * as the message to them. Project trailing content with `giddyPersonItemTrailing`.
 */
@Component({
  selector: 'li[giddy-person-item]',
  imports: [AvatarComponent],
  templateUrl: './person-item.html',
  styleUrl: './person-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'list__item person-item' },
})
export class PersonItemComponent {
  /** Whose initials the avatar shows. */
  readonly name = input.required<string>();
  readonly heading = input.required<string>();
  readonly pop = input<PopColour>('grape');
}
