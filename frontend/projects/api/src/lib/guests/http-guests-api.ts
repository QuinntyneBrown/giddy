import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AllergyListShared } from './allergy-list-shared';
import { GuestList } from './guest-list';
import { GuestsApi } from './guests-api';
import { RemindersSent } from './reminders-sent';

@Injectable()
export class HttpGuestsApi implements GuestsApi {
  private readonly http = inject(HttpClient);

  list(partyId: string): Observable<GuestList> {
    return this.http.get<GuestList>(`/api/parties/${partyId}/guests`);
  }

  remind(partyId: string, guestIds: string[]): Observable<RemindersSent> {
    return this.http.post<RemindersSent>(`/api/parties/${partyId}/reminders`, { guestIds });
  }

  shareAllergyList(partyId: string): Observable<AllergyListShared> {
    return this.http.post<AllergyListShared>(`/api/parties/${partyId}/allergy-list/share`, null);
  }
}
