import { InvitationDesign } from './invitation-design';

/** PUT /api/parties/{id}/invitation */
export interface InvitationEdit {
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
