import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { HttpPartiesApi } from './parties/http-parties-api';
import { PARTIES_API } from './parties/parties-api.token';
import { HttpSessionApi } from './session/http-session-api';
import { SESSION_API } from './session/session-api.token';

/** Binds every API contract to its HTTP implementation. Requires provideHttpClient(). */
export function provideGiddyApi(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: SESSION_API, useClass: HttpSessionApi },
    { provide: PARTIES_API, useClass: HttpPartiesApi },
  ]);
}
