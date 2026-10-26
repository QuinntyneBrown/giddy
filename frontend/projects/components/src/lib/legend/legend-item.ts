import { PopColour } from '../pop/pop-colour';

export interface LegendItem {
  /** The words beside the swatch, such as “Venue $340”; colour is never the only cue. */
  label: string;
  pop: PopColour;
}
