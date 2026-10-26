/** PUT /api/rsvp/{token} */
export interface RsvpReply {
  coming: boolean;
  allergies: string | null;
  parentStaying: boolean | null;
  siblings: number | null;
  parentName: string;
  mobile: string | null;
  note: string | null;
}
