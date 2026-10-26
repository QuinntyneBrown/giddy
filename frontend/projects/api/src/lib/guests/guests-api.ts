import { Observable } from 'rxjs';
import { AllergyListShared } from './allergy-list-shared';
import { Guest } from './guest';
import { GuestList } from './guest-list';
import { ImportPreview } from './import-preview';
import { ImportReport } from './import-report';
import { ImportSource } from './import-source';
import { NewGuest } from './new-guest';
import { RemindersSent } from './reminders-sent';

export interface GuestsApi {
  list(partyId: string): Observable<GuestList>;
  /** 409 when the guest is already on the list or the list is full. */
  add(partyId: string, guest: NewGuest): Observable<Guest>;
  remove(partyId: string, guestId: string): Observable<void>;
  /** Undo a removal, within ten minutes. */
  restore(partyId: string, guestId: string): Observable<Guest>;
  remind(partyId: string, guestIds: string[]): Observable<RemindersSent>;
  shareAllergyList(partyId: string): Observable<AllergyListShared>;
  checkImport(partyId: string, file: File): Observable<ImportPreview>;
  importFile(partyId: string, file: File): Observable<ImportReport>;
  importSources(partyId: string): Observable<ImportSource[]>;
  importFromParty(partyId: string, sourcePartyId: string): Observable<ImportReport>;
}
