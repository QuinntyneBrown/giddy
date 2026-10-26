import { RatedProvider } from '@giddy/api';

export interface ReviewDialogData {
  partyId: string;
  /** Already rated: a review goes with the stars. */
  provider: RatedProvider;
}
