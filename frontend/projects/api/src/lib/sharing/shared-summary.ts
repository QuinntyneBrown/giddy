/** What anyone with the view-only link sees: no guests' contact details or allergies. */
export interface SharedSummary {
  name: string;
  childName: string | null;
  date: string;
  startsAt: string;
  endsAt: string;
  theme: string | null;
  venue: string | null;
  coming: number;
  plan: string[];
}
