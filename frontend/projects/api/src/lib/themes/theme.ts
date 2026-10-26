/** A party theme in the catalogue. */
export interface Theme {
  id: string;
  name: string;
  emoji: string;
  description: string;
  minAge: number;
  maxAge: number;
  outdoor: boolean;
  budgetFriendly: boolean;
  /** The child's interests, as Giddy remembers them, include this theme. */
  matchesInterests: boolean;
  /** The party's current theme. */
  chosen: boolean;
}
