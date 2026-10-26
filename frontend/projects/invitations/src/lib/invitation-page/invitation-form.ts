import { InvitationDesign } from '@giddy/api';

/** What the parent is editing on the invitation page. */
export interface InvitationForm {
  design: InvitationDesign;
  headline: string;
  message: string;
  rsvpBy: string;
  askAllergies: boolean;
  askParentStaying: boolean;
  askSiblings: boolean;
  byEmail: boolean;
  byText: boolean;
}
