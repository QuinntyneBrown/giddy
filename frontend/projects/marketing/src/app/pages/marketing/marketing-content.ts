import { PopColour } from '@giddy/components';

/** One theme on the marketing page's "Popular themes" grid. */
export interface MarketingTheme {
  name: string;
  emoji: string;
  pop: PopColour;
  blurb: string;
}
