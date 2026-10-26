/** Who, when, where, guests and budget for the party a conversation is about. */
export interface PartyAtAGlance {
  partyId: string;
  name: string;
  childName: string | null;
  turningAge: number | null;
  /** For example "Zuri, turning 7". */
  who: string | null;
  /** ISO calendar date in America/Toronto. */
  date: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  area: string | null;
  radiusKm: number | null;
  guests: number | null;
  /** Canadian dollars, HST included. */
  budget: number | null;
}
