import { Guest } from '@giddy/api';

export interface RemoveGuestData {
  partyId: string;
  guest: Guest;
}
