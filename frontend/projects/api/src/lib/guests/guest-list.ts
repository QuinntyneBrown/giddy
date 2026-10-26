import { AllergyEntry } from './allergy-entry';
import { Guest } from './guest';
import { GuestCounts } from './guest-counts';

/** GET /api/parties/{id}/guests */
export interface GuestList {
  guests: Guest[];
  counts: GuestCounts;
  allergyList: AllergyEntry[];
}
