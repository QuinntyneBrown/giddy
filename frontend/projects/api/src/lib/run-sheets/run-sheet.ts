import { AllergyEntry } from '../guests/allergy-entry';
import { QuickCall } from './quick-call';
import { RunStep } from './run-step';

/** Everything the parent needs on the day. */
export interface RunSheet {
  /** yyyy-MM-dd. */
  date: string;
  /** HH:mm. */
  startsAt: string;
  endsAt: string;
  /** Children who said they're coming. */
  coming: number;
  /** Empty until Giddy drafts the run sheet. */
  steps: RunStep[];
  contacts: QuickCall[];
  allergies: AllergyEntry[];
}
