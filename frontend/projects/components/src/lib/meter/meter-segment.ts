import { PopColour } from '../pop/pop-colour';

export interface MeterSegment {
  /** Share of the whole, 0–100. */
  percent: number;
  pop: PopColour;
}
