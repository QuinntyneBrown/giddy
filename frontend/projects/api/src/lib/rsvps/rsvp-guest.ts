import { RsvpStatus } from '../guests/rsvp-status';

/** The family's own reply; the page never sees anyone else on the list. */
export interface RsvpGuest {
  childFirstName: string;
  /** "the Chen family" */
  familyName: string;
  parentName: string;
  rsvp: RsvpStatus;
  allergies: string | null;
  parentStaying: boolean | null;
  siblings: number | null;
  mobile: string | null;
  note: string | null;
}
