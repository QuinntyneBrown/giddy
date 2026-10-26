import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { CONVERSATIONS_API } from './conversations/conversations-api.token';
import { HttpConversationsApi } from './conversations/http-conversations-api';
import { FAMILY_API } from './family/family-api.token';
import { HttpFamilyApi } from './family/http-family-api';
import { HOME_API } from './home/home-api.token';
import { HttpHomeApi } from './home/http-home-api';
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
  ]);
}
