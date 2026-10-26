import { Observable } from 'rxjs';
import { NoteInput } from './note-input';
import { PlanTemplate } from './plan-template';
import { RatedProvider } from './rated-provider';
import { RatingInput } from './rating-input';
import { SavedPlan } from './saved-plan';
import { WrapUp } from './wrap-up';

export interface WrapUpApi {
  get(partyId: string): Observable<WrapUp>;
  saveNote(partyId: string, guestId: string, note: NoteInput): Observable<void>;
  /** Emails every unsent note that has an address; answers how many went. */
  sendNotes(partyId: string): Observable<{ sent: number }>;
  rate(partyId: string, providerId: string, rating: RatingInput): Observable<RatedProvider>;
  saveTemplate(partyId: string): Observable<SavedPlan>;
  template(templateId: string): Observable<PlanTemplate>;
}
