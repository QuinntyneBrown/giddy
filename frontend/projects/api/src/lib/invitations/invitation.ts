import { InvitationDetails } from './invitation-details';
import { InvitationEdit } from './invitation-edit';

/** GET /api/parties/{id}/invitation: Giddy's draft until the parent saves changes. */
export interface Invitation extends InvitationEdit {
  families: number;
  /** Families with an email address. */
  emailReach: number;
  /** Families with a mobile number. */
  textReach: number;
  /** Families not sent the invitation yet. */
  notSent: number;
  details: InvitationDetails;
  sentAt: string | null;
  automaticReminderOn: string;
}
