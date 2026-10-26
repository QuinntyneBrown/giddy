import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, filter, map } from 'rxjs';
import { AllergyListShared } from './allergy-list-shared';
import { Guest } from './guest';
import { GuestList } from './guest-list';
import { GuestsApi } from './guests-api';
import { ImportEvent } from './import-event';
import { ImportPreview } from './import-preview';
import { ImportReport } from './import-report';
import { ImportSource } from './import-source';
import { NewGuest } from './new-guest';
import { RemindersSent } from './reminders-sent';

@Injectable()
export class HttpGuestsApi implements GuestsApi {
  private readonly http = inject(HttpClient);

  list(partyId: string): Observable<GuestList> {
    return this.http.get<GuestList>(`/api/parties/${partyId}/guests`);
  }

  add(partyId: string, guest: NewGuest): Observable<Guest> {
    return this.http.post<Guest>(`/api/parties/${partyId}/guests`, guest);
  }

  remove(partyId: string, guestId: string): Observable<void> {
    return this.http.delete(`/api/parties/${partyId}/guests/${guestId}`).pipe(map(() => undefined));
  }

  restore(partyId: string, guestId: string): Observable<Guest> {
    return this.http.post<Guest>(`/api/parties/${partyId}/guests/${guestId}/restore`, null);
  }

  remind(partyId: string, guestIds: string[]): Observable<RemindersSent> {
    return this.http.post<RemindersSent>(`/api/parties/${partyId}/reminders`, { guestIds });
  }

  shareAllergyList(partyId: string): Observable<AllergyListShared> {
    return this.http.post<AllergyListShared>(`/api/parties/${partyId}/allergy-list/share`, null);
  }

  checkImport(partyId: string, file: File): Observable<ImportPreview> {
    return this.http.post<ImportPreview>(`/api/parties/${partyId}/imports/check`, form(file));
  }

  importFile(partyId: string, file: File): Observable<ImportEvent> {
    return this.http
      .post<ImportReport>(`/api/parties/${partyId}/imports`, form(file), {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        filter((e) => e.type === HttpEventType.UploadProgress || e.type === HttpEventType.Response),
        map((e): ImportEvent =>
          e.type === HttpEventType.Response
            ? { kind: 'done', report: e.body! }
            : {
                kind: 'progress',
                percent:
                  e.type === HttpEventType.UploadProgress && e.total
                    ? Math.round((e.loaded / e.total) * 100)
                    : 0,
              },
        ),
      );
  }

  importSources(partyId: string): Observable<ImportSource[]> {
    return this.http.get<ImportSource[]>(`/api/parties/${partyId}/imports/sources`);
  }

  importFromParty(partyId: string, sourcePartyId: string): Observable<ImportReport> {
    return this.http.post<ImportReport>(`/api/parties/${partyId}/imports/from-party`, {
      sourcePartyId,
    });
  }
}

function form(file: File): FormData {
  const data = new FormData();
  data.append('file', file, file.name);
  return data;
}
