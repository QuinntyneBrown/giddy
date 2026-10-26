import { InjectionToken } from '@angular/core';
import { SessionApi } from './session-api';

export const SESSION_API = new InjectionToken<SessionApi>('SESSION_API');
