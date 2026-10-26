/** The signed-in parent, as returned by GET /api/session. */
export interface Session {
  parentId: string;
  name: string;
  email: string;
  /** Sending invitations needs a verified email. */
  emailVerified: boolean;
  /** The confirmation email couldn't be delivered. */
  emailBounced: boolean;
}
