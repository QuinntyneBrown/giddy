import { InvitationDesign } from '../invitations/invitation-design';
import { InvitationDetails } from '../invitations/invitation-details';
import { RsvpGuest } from './rsvp-guest';

/** GET /api/rsvp/{token}: anonymous, for the family with the private link. */
export interface Rsvp {
  invitation: {
    design: InvitationDesign;
    headline: string;
    message: string;
    rsvpBy: string;
    details: InvitationDetails;
  };
  guest: RsvpGuest;
  questions: { allergies: boolean; parentStaying: boolean; siblings: boolean };
  /** Replies can change until the RSVP-by date. */
  canChange: boolean;
}
