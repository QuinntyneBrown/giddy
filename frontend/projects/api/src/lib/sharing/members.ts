import { PartyRole } from '../parties/party-role';
import { PlanMember } from './planner';

export interface Members {
  members: PlanMember[];
  /** Invitations not yet accepted. */
  invited: { email: string; role: PartyRole }[];
}
