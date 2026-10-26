import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Rsvp } from './rsvp';
import { RsvpApi } from './rsvp-api';
import { RsvpReply } from './rsvp-reply';

@Injectable()
export class HttpRsvpApi implements RsvpApi {
  private readonly http = inject(HttpClient);

  get(token: string): Observable<Rsvp> {
    return this.http.get<Rsvp>(`/api/rsvp/${encodeURIComponent(token)}`);
  }

  reply(token: string, reply: RsvpReply): Observable<Rsvp> {
    return this.http.put<Rsvp>(`/api/rsvp/${encodeURIComponent(token)}`, reply);
  }

  calendarUrl(token: string): string {
    return `/api/rsvp/${encodeURIComponent(token)}/calendar.ics`;
  }
}
