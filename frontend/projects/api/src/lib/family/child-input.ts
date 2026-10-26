export interface ChildInput {
  firstName: string;
  /** yyyy-MM-dd. */
  birthday: string;
  /** Up to five, from the interests list. */
  interests: string[];
  allergies: string | null;
}
