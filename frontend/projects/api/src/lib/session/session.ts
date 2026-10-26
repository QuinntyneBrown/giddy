/** The signed-in parent, as returned by GET /api/session. */
export interface Session {
  parentId: string;
  name: string;
  email: string;
}
