import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { BOOKINGS_API } from './bookings/bookings-api.token';
import { HttpBookingsApi } from './bookings/http-bookings-api';
import { GUESTS_API } from './guests/guests-api.token';
import { HttpGuestsApi } from './guests/http-guests-api';
import { HttpInvitationsApi } from './invitations/http-invitations-api';
import { INVITATIONS_API } from './invitations/invitations-api.token';
import { HttpLiveUpdatesApi } from './live/http-live-updates-api';
import { LIVE_UPDATES_API } from './live/live-updates-api.token';
import { HttpRsvpApi } from './rsvps/http-rsvp-api';
import { RSVP_API } from './rsvps/rsvp-api.token';
import { CONVERSATIONS_API } from './conversations/conversations-api.token';
import { HttpConversationsApi } from './conversations/http-conversations-api';
import { FAMILY_API } from './family/family-api.token';
import { HttpFamilyApi } from './family/http-family-api';
import { HOME_API } from './home/home-api.token';
import { HttpHomeApi } from './home/http-home-api';
import { HttpVendorsApi } from './vendors/http-vendors-api';
import { VENDORS_API } from './vendors/vendors-api.token';
import { HttpVenuesApi } from './venues/http-venues-api';
import { VENUES_API } from './venues/venues-api.token';
import { HttpMemoriesApi } from './memories/http-memories-api';
import { MEMORIES_API } from './memories/memories-api.token';
import { HttpPartiesApi } from './parties/http-parties-api';
import { PARTIES_API } from './parties/parties-api.token';
import { HttpSessionApi } from './session/http-session-api';
import { SESSION_API } from './session/session-api.token';

/** Binds every API contract to its HTTP implementation. Requires provideHttpClient(). */
export function provideGiddyApi(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: SESSION_API, useClass: HttpSessionApi },
    { provide: PARTIES_API, useClass: HttpPartiesApi },
    { provide: CONVERSATIONS_API, useClass: HttpConversationsApi },
    { provide: MEMORIES_API, useClass: HttpMemoriesApi },
    { provide: FAMILY_API, useClass: HttpFamilyApi },
    { provide: HOME_API, useClass: HttpHomeApi },
    { provide: VENUES_API, useClass: HttpVenuesApi },
    { provide: VENDORS_API, useClass: HttpVendorsApi },
    { provide: BOOKINGS_API, useClass: HttpBookingsApi },
    { provide: GUESTS_API, useClass: HttpGuestsApi },
    { provide: INVITATIONS_API, useClass: HttpInvitationsApi },
    { provide: RSVP_API, useClass: HttpRsvpApi },
    { provide: LIVE_UPDATES_API, useClass: HttpLiveUpdatesApi },
  ]);
}
