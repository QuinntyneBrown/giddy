/** POST /api/parties/{id}/guests */
export interface NewGuest {
  childName: string;
  parentName: string;
  email: string;
  mobile: string | null;
  /** Invite straight away if the invitations have already gone out. */
  sendNow: boolean;
}
