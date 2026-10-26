import { Observable } from 'rxjs';
import { AllergyListShared } from './allergy-list-shared';
import { GuestList } from './guest-list';
import { RemindersSent } from './reminders-sent';

export interface GuestsApi {
  list(partyId: string): Observable<GuestList>;
  remind(partyId: string, guestIds: string[]): Observable<RemindersSent>;
  shareAllergyList(partyId: string): Observable<AllergyListShared>;
}
