import { Observable } from 'rxjs';
import { Rsvp } from './rsvp';
import { RsvpReply } from './rsvp-reply';

export interface RsvpApi {
  /** Fails with 404 when the link no longer works. */
  get(token: string): Observable<Rsvp>;
  reply(token: string, reply: RsvpReply): Observable<Rsvp>;
  /** The address of the party's .ics file. */
  calendarUrl(token: string): string;
}
