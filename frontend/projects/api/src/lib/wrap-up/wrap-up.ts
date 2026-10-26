import { FinalNumbers } from './final-numbers';
import { RatedProvider } from './rated-provider';
import { SavedPlan } from './saved-plan';
import { ThankYouNote } from './thank-you-note';

export interface WrapUp {
  /** Whether the party has happened; wrap-up opens the day after. */
  open: boolean;
  /** ISO date of the day after the party. */
  opensOn: string;
  childName: string | null;
  notes: ThankYouNote[];
  providers: RatedProvider[];
  numbers: FinalNumbers;
  template: SavedPlan | null;
}
