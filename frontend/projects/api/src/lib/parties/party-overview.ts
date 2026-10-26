import { PartyMember } from './party-member';
import { PartyRole } from './party-role';
import { PartyTask } from './party-task';
import { RsvpCounts } from './rsvp-counts';

/** GET /api/parties/{id}/overview: everything but booking statuses. */
export interface PartyOverview {
  id: string;
  name: string;
  date: string;
  startsAt: string;
  endsAt: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  daysToGo: number;
  area: string | null;
  venueName: string | null;
  theme: string | null;
  guests: number | null;
  readiness: number;
  doneTasks: number;
  totalTasks: number;
  nextTasks: PartyTask[];
  nextStep: string | null;
  allergies: string[];
  budget: number | null;
  planned: number;
  rsvps: RsvpCounts;
  members: PartyMember[];
  role: PartyRole;
  canDelete: boolean;
  locked: boolean;
}
