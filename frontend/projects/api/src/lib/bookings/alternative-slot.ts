/** A free slot offered when the chosen one was taken (the 409 problem's alternatives). */
export interface AlternativeSlot {
  venueId: string;
  venueName: string;
  start: string;
  end: string;
}
