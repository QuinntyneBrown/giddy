import { RsvpStatus } from './rsvp-status';

/** A family on the guest list. Only planners get the parent's email and mobile. */
export interface Guest {
  id: string;
  childName: string;
  parentName: string;
  rsvp: RsvpStatus;
  allergies: string | null;
  parentStaying: boolean | null;
  note: string | null;
  email: string | null;
  mobile: string | null;
  hasEmail: boolean;
  hasMobile: boolean;
  emailBounced: boolean;
  lastRemindedAt: string | null;
}
