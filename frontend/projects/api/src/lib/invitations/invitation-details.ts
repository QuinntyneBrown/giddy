/** When and where, as the invitation shows it. */
export interface InvitationDetails {
  childName: string;
  date: string;
  startsAt: string;
  endsAt: string;
  /** The venue and its address, or the party's area. */
  place: string | null;
  hostName: string;
}
