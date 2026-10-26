import { PartyRole } from './party-role';

export interface PartyMember {
  parentId: string;
  name: string;
  role: PartyRole;
  isYou: boolean;
}
