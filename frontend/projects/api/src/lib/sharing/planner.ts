import { PartyRole } from '../parties/party-role';

export interface PlanMember {
  parentId: string;
  name: string;
  role: PartyRole;
  isYou: boolean;
}
