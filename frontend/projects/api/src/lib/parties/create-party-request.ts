import { TimeOfDay } from './time-of-day';

/** POST /api/parties. Either a child of the family or someone else's name and age. */
export interface CreatePartyRequest {
  childId: string | null;
  childName: string | null;
  turningAge: number | null;
  /** ISO date, from tomorrow onwards. */
  date: string;
  guests: number;
  timeOfDay: TimeOfDay;
  budget: number;
  postalCode: string;
}
