export interface AddGuestData {
  partyId: string;
  /** Pre-filled, for example from the search box. */
  childName: string;
  /** When the invitations went out (ISO date), or null if they haven't yet. */
  invitesSentOn: string | null;
}
