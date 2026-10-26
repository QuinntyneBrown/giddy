export interface Child {
  id: string;
  firstName: string;
  /** ISO dates. */
  birthday: string;
  nextBirthday: string;
  turningAge: number;
  /** Calendar days from today in Toronto to the next birthday. */
  daysUntil: number;
  interests: string[];
  allergies: string | null;
  /** The party planned for the next birthday, if there is one. */
  partyId: string | null;
}
