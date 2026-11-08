import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ButtonComponent,
  CardComponent,
  ChipComponent,
  FeatureListComponent,
  FooterComponent,
  FooterLink,
  HeroComponent,
  MascotComponent,
  TileComponent,
  TopBarComponent,
  VideoComponent,
} from '@giddy/components';
import { environment } from '../../../environments/environment';
import { MarketingTheme } from './marketing-content';
import { RevealDirective } from './reveal.directive';

/**
 * The marketing page (L2-095), composed from the library as docs/screen-composition.md lists. Links
 * into the app are absolute addresses built from `environment.appUrl`.
 */
@Component({
  selector: 'mk-marketing-page',
  imports: [
    ButtonComponent,
    CardComponent,
    ChipComponent,
    FeatureListComponent,
    FooterComponent,
    HeroComponent,
    MascotComponent,
    RevealDirective,
    TileComponent,
    TopBarComponent,
    VideoComponent,
  ],
  templateUrl: './marketing-page.html',
  styleUrl: './marketing-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketingPageComponent {
  protected readonly signUpUrl = `${environment.appUrl}/sign-up`;
  protected readonly signInUrl = `${environment.appUrl}/sign-in`;

  protected readonly themes: MarketingTheme[] = [
    {
      name: 'Dino Dig',
      emoji: '🦕',
      pop: 'mint',
      blurb: 'Fossil hunts, volcano science and roaring fun',
    },
    {
      name: 'Outer Space',
      emoji: '🚀',
      pop: 'grape',
      blurb: 'Rocket crafts, star maps and moon-bounce games',
    },
    {
      name: 'Under the Sea',
      emoji: '🐠',
      pop: 'sky',
      blurb: 'Bubble stations, mermaid tails and treasure',
    },
    {
      name: 'Unicorn Rainbow',
      emoji: '🦄',
      pop: 'pink',
      blurb: 'Glitter horns, rainbow cake and pony games',
    },
    {
      name: 'Superhero City',
      emoji: '🦸',
      pop: 'orange',
      blurb: 'Capes, obstacle courses and secret missions',
    },
    {
      name: 'Mad Science',
      emoji: '🧪',
      pop: 'sun',
      blurb: 'Slime, fizzing potions and a lab coat each',
    },
  ];

  protected readonly parentBenefits = [
    'A budget that adds up every booking and cost as you go',
    'Invitations with RSVPs and allergies collected in one list',
    'A checklist with reminders, so nothing slips',
    'A run sheet for the day that works even offline',
    'Thank-you notes and a template for next year',
  ];

  protected readonly areas = [
    'Toronto',
    'Mississauga',
    'Brampton',
    'Markham',
    'Vaughan',
    'Richmond Hill',
    'Oakville',
    'Pickering',
    'Ajax',
    'Whitby',
  ];

  protected readonly footerLinks: FooterLink[] = [
    { label: 'How it works', href: '#how' },
    { label: 'Watch the tour', href: '#watch' },
    { label: 'Sign in', href: this.signInUrl },
  ];
}
