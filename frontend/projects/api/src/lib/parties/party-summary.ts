import { PartyRole } from './party-role';

/** A party the signed-in parent belongs to, as returned by GET /api/parties. */
export interface PartySummary {
  id: string;
  name: string;
  /** Calendar date in America/Toronto, ISO format (2026-11-14). */
  date: string;
  /** Local 24-hour start time (13:00). */
  startsAt: string;
  endsAt: string;
  role: PartyRole;
  /** Calendar days from today in Toronto; 0 on party day. */
  daysToGo: number;
}
