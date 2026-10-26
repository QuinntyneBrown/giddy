import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NoteInput } from './note-input';
import { PlanTemplate } from './plan-template';
import { RatedProvider } from './rated-provider';
import { RatingInput } from './rating-input';
import { SavedPlan } from './saved-plan';
import { WrapUp } from './wrap-up';
import { WrapUpApi } from './wrap-up-api';

@Injectable()
export class HttpWrapUpApi implements WrapUpApi {
  private readonly http = inject(HttpClient);

  get(partyId: string): Observable<WrapUp> {
    return this.http.get<WrapUp>(`/api/parties/${partyId}/wrap-up`);
  }

  saveNote(partyId: string, guestId: string, note: NoteInput): Observable<void> {
    return this.http.put<void>(`/api/parties/${partyId}/thank-yous/${guestId}`, note);
  }

  sendNotes(partyId: string): Observable<{ sent: number }> {
    return this.http.post<{ sent: number }>(`/api/parties/${partyId}/thank-yous/send`, {});
  }

  rate(partyId: string, providerId: string, rating: RatingInput): Observable<RatedProvider> {
    return this.http.put<RatedProvider>(`/api/parties/${partyId}/ratings/${providerId}`, rating);
  }

  saveTemplate(partyId: string): Observable<SavedPlan> {
    return this.http.post<SavedPlan>(`/api/parties/${partyId}/template`, {});
  }

  template(templateId: string): Observable<PlanTemplate> {
    return this.http.get<PlanTemplate>(`/api/templates/${templateId}`);
  }
}
