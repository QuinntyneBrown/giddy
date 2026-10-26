/** One of Giddy's nudges on Home. */
export interface Nudge {
  partyId: string;
  partyName: string;
  title: string;
  kind: 'overdue' | 'needsYou' | 'idea';
  context: string;
  actionLabel: string;
}
